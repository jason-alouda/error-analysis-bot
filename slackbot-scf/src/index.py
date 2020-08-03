import os
import json
import urllib.request
import requests

def prettify(content):
    content = content.replace('[[', '\n')
    content = content.replace(']]', '')
    content = content.replace('], [', '\n')
    content = content.replace('\"', '')
    content = content.replace('\'', '')
    content = content.replace(',', ':')
    return content

def main_handler(event, context):
    api_url = os.environ.get("url")
    error_url = os.environ.get("error_url")
    r = requests.get(error_url)
    error_data = r.json()

    content1 = prettify(str(error_data["Total deployments"]))
    content2 = prettify(str(error_data["Component Errors"]))
    content3 = prettify(str(error_data["Component Failure Rates (%)"]))
    content4 = prettify(str(error_data["Component Type Errors"]))

    final_data = {
        "blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Daily Components Failure Rates:*",
			}
		},
        {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Total deployments: " + content1,
			}
		},
        {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Component Errors: " + content2,
			}
		},
        {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Component Failure Rates (%): " + content3,
			}
		},
        {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Component Error Types: " + content4,
			}
		}
        ]
    }

    data = json.dumps(final_data).encode("utf-8")
    req_attr = urllib.request.Request(api_url, data)
    resp_attr = urllib.request.urlopen(req_attr)
    return resp_attr.read().decode("utf-8")
