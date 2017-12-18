from botocore.vendored import requests
import boto3

db = boto3.resource("dynamodb")
act_table = db.Table("Hangout-activity")

endpoint = "https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities_test/activity/"

def lambda_handler(event, context):
    userid = event["userId"]
    event["activity"]["userId"] = userid;
    r = requests.post(endpoint, json=event["activity"])
    res = r.json()
    act_id = res['_id']
    act_table.put_item(Item={"id": act_id, "userlist": [userid]})
    return res
