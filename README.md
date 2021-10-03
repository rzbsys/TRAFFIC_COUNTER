<h1>설치 방법</h1>

<h1>이미지</h1>
<img src="https://user-images.githubusercontent.com/75260489/135726640-bd389852-2bb9-40e6-9b9c-52d98fedb4d1.png" width="400"><img src="https://user-images.githubusercontent.com/75260489/135726767-bee035d9-d4ee-469e-b395-cb727241dec4.png" width="400">

<h1>주의사항</h1>
<b>HTML에서 DeepSort를 통해 만든 영상을 재생하기 위해서는 비디오의 인코딩 방식을 바꾸어 주어야 합니다.<br/>
track.py 파일에서 fourcc로 인자를 받지만, 코드 분석 결과 인코딩 방식은 고정되어있는 것으로 확인되었습니다.(2021년 9월) 따라서, 아래 경로에서 인코딩 방식을 변경해 주어야 코드가 정상적으로 동작합니다.</b><br><br>
#Path<br/>
Yolov5_DeepSort_Pytorch\track.py
<br><br>#Before<br/>
180 | vid_writer = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (w, h))
<br><br>#After<br>
180 | vid_writer = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*'avc1'), fps, (w, h))<br><br>

<b>track.py를 실행시킬 경우 Output으로 지정한 경로의 파일 전부가 사라집니다.<br/>
따라서, 아래 경로에서 다음 줄을 주석 처리하거나 제거해주세요.</b><br/>
  
#Path<br/>
Yolov5_DeepSort_Pytorch\track.py<br>

#Before<br/>
49 | if os.path.exists(out):<br/>
50 |    pass<br/>
51 |    shutil.rmtree(out)  # delete output folder 52 | os.makedirs(out)  # make new output folder 

#After<br>
49 | #if os.path.exists(out):<br/>
50 | #   pass<br/>
51 | #   shutil.rmtree(out)  # delete output folder 52 | #os.makedirs(out)  # make new output folder
