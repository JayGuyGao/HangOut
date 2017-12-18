import boto3
from botocore.vendored import requests

endpoint = "https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities_test/activity/"
db = boto3.resource("dynamodb")
attend_table = db.Table("Hangout-userattendance")

def lambda_handler(event, context):
    userid = event["userId"]
    act_list = []
    try:
        act_list = attend_table.get_item(Key={"userid": userid})
        act_list = act_list['Item']['activitylist']
    except:
        pass
    result = []
    for item in act_list:
        url = endpoint + item
        r = requests.get(url)
        try:
            act = r.json()["_source"]
            act["id"] = item
            result.append(act)
        except:
            pass
    return {'activities': result}
