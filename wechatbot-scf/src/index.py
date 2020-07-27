import os
import json
import urllib.request
import requests

def main_handler(event, context):
    api_url = os.environ.get("url")
    error_url = os.environ.get("error_url")
    #req_error_info = urllib.request.Request(error_url)
    #resp_error_info = urllib.request.urlopen(req_error_info)
    #error_data = resp_error_info.read().decode("utf-8")
    r = requests.get(error_url)
    # error_data = r.json()
    error_data = r.text

    final_data = {
        "msgtype": "text",
        "text": {
            #"content": ["Daily component failures statistics", error_data[1], error_data[2]],
            "content": "Daily component failures statistics:\n" + error_data,
        }
    }

    #final_data = {"ComponentFailures": error_data[1], "ComponentTypesFailures": error_data[2]}
    #r1 = requests.post(api_url, final_data)
    #return r1.json()

    data = json.dumps(final_data).encode("utf-8")
    req_attr = urllib.request.Request(api_url, data)
    resp_attr = urllib.request.urlopen(req_attr)
    return resp_attr.read().decode("utf-8")
