import os
import json
import urllib.request
import requests

def main_handler(event, context):
    api_url = os.environ.get("url")
    error_url = os.environ.get("error_url")
    r = requests.get(error_url)
    error_data = r.json()

    content = "Daily component failures statistics:\n" + "\n Total Deployments: \n" + str(error_data["Total deployments"]) +\
    "\n" + "\n Component Errors: \n" + str(error_data["Component Errors"]) + "\n" +\
    "\n Components Failure Rates (%): \n" + str(error_data["Component Failure Rates (%)"]) +\
    "\n" + "\n Component Error Types: \n" + str(error_data["Component Type Errors"])
    content = content.replace('[[', '')
    content = content.replace(']]', '')
    content = content.replace('], [', '\n')
    content = content.replace('\"', '')
    content = content.replace('\'', '')
    content = content.replace(',', ':')

    final_data = {
        "msgtype": "text",
        "text": {
            "content": content
        }
    }

    data = json.dumps(final_data).encode("utf-8")
    req_attr = urllib.request.Request(api_url, data)
    resp_attr = urllib.request.urlopen(req_attr)
    return resp_attr.read().decode("utf-8")
