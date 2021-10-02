from bs4 import BeautifulSoup
import requests

URL = 'http://traffic.daejeon.go.kr/map/trafficInfo/cctvCk.do?cctvId='
def download_vid_file(id):    
    webpage = requests.get(URL + id, headers={'Cache-Control': 'no-cache'})
    soup = BeautifulSoup(webpage.content, "html.parser")
    url = soup.video['src']
    return url
