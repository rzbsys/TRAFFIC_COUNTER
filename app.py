from flask import Flask, render_template, request, url_for, Response, send_file, after_this_request
from flask_cors import CORS
import subprocess, requests, os, shutil, time
from datas.location import get_full_loc, get_id
from datas.download import download_vid_file

model_dir = 'datas/yolov5x.pt'
app = Flask(__name__)
CORS(app)

global CONF
CONF = 0.5

def count_cnt(url):
    f = open(url, 'r')
    data = f.read()
    car_cnt = set()
    for i in data.split('\n'):
        line = i.split(' ')
        line = list(map(int, line[:-2]))
        if len(line) == 0:
            break
        car_cnt.add(line[1])
    return len(car_cnt)
        

def log_subprocess_output(pipe):
    for line in iter(pipe.readline, b''):
        print('S :', str(line)[2:-5])

def download(url, file_name):
    with open(file_name, "wb") as file:
        response = requests.get(url)
        file.write(response.content)

def make_archive(source, destination):
    archive_from = os.path.dirname(source)
    archive_to = os.path.basename(source.strip(os.sep))
    shutil.make_archive('data', 'zip', archive_from, archive_to)
    shutil.move('%s.%s'%('data', 'zip'), destination)

@app.route('/')
def f1():
    loc_list = get_full_loc()
    return render_template('main.html', loc_list=loc_list, enumerate=enumerate, get_id=get_id, CONF=CONF)

@app.route('/download', methods=['GET'])
def zip_download():
    try:
        os.remove('static/data.zip')
    except:
        print('Remove Fail')
    make_archive('static/vid', 'static/')
    return send_file('static/data.zip', mimetype='application/zip', attachment_filename='data.zip', as_attachment=True)

@app.route('/setting', methods=['POST'])
def setting():
    Conf = float(request.form['CONF'])
    print('CONF value changed!', Conf)
    return Response(status=200)

@app.route('/load_pre', methods=['POST'])
def f3():
    id = request.form['id']
    file = download_vid_file(id)
    print('----- CCTV Video Download -----')
    file_list = list(os.listdir('static/vid/processed/'))
    file_len = str(int(len(file_list) / 2) + 1)
    save_url = 'static/vid/cache/%s' % (id + '-' + file_len + '.mp4')
    download(file, save_url)
    print('----- DeepSort Predict -----')
    configs_text = '--output ../static/vid/processed/ --save-vid --save-txt --conf-thres %f --source %s --yolo_weights %s' % (CONF, '../' + (save_url), '../' + model_dir)    
    #COCO Datasets  
    configs_text += ' --classes 2 3 5 7'
    #process = subprocess.Popen(['python', 'track.py'] + configs_text.split(' '), cwd='Yolov5_DeepSort_Pytorch', stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=False)
    #with process.stdout:
    #    log_subprocess_output(process.stdout)
    try:
        car_cnt = count_cnt('static/vid/processed/%s' % (id + '-' + file_len + '.txt'))
    except:
        car_cnt = 0

    time.sleep(5)
    return {'res' : url_for('static', filename='vid/processed/%s' % (id + '-' + file_len + '.mp4')), 'cnt':car_cnt}


if __name__ == '__main__':
    app.run('0.0.0.0', port=80, debug=True)
