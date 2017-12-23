from botocore.vendored import requests
import boto3
import base64
import uuid

db = boto3.resource("dynamodb")
act_table = db.Table("Hangout-activity")
attd_table = db.Table("Hangout-userattendance")
s3 = boto3.resource("s3")
bucket = s3.Bucket("hangout-new")

endpoint = "https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities_test/activity/"

def lambda_handler(event, context):
    userid = event["userId"]
    event["activity"]["userId"] = userid;
    if not event["activity"].has_key("picture"):
        return {'Error': 'Please upload a picture.'}
    if not event["activity"].has_key("place"):
        return {'Error': 'Please set a location.'}
    if not event["activity"].has_key("name"):
        return {'Error': 'Please set a name.'}
    if not event["activity"].has_key("start_time"):
        return {'Error': 'Please set a start datetime.'}
    if not event["activity"].has_key("applyend_time"):
        return {'Error': 'Please set a application deadline.'}
    if not event["activity"].has_key("end_time"):
        return {'Error': 'Please set an end datetime.'}
    startime = event["activity"]["start_time"]
    endtime = event["activity"]["end_time"]
    deadline = event["activity"]["applyend_time"]
    print(deadline)
    print(startime)
    print(endtime)
    if startime > endtime:
        return {'Error': 'Start time cannot be later than end time.'}
    if deadline > startime:
        return {'Error': 'Application deadline cannot be later than start time.'}
    (type, data) = event["activity"]["picture"].split(';', 1)
    type = type.split('/')[1]
    data = data.split(',')[1]
    pic = base64.b64decode(data)
    filename = "img/upload/{}.".format(uuid.uuid4()) + type
    bucket.put_object(Key=filename, Body=pic, ACL='public-read')
    event["activity"]["picture"] = filename
    r = requests.post(endpoint, json=event["activity"])
    res = r.json()
    act_id = res['_id']
    act_table.put_item(Item={"id": act_id, "userlist": [userid]})
    attd_table.update_item(Key={"userid": userid},
            UpdateExpression="set #actlist=list_append(if_not_exists(#actlist, :empty_list), :act)",
            ExpressionAttributeNames={'#actlist': "activitylist"},
            ExpressionAttributeValues={':act': [act_id], ':empty_list': []},
            ReturnValues="UPDATED_NEW")
    return res
