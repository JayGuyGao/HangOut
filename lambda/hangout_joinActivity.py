import boto3
import os
import datetime
from botocore.vendored import requests

DEFAULT_USER_POOL_ID = os.environ.get('DEFAULT_USER_POOL_ID')
endpoint = "https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities_test/activity/"
db = boto3.resource("dynamodb")
act_table = db.Table("Hangout-activity")
attd_table = db.Table("Hangout-userattendance")
idp_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    userId = event["userId"]
    act_id = event["activity"]["act_id"]
    r = requests.get(endpoint + act_id)
    try:
       act = r.json()["_source"]
    except:
       return {'Error': 'Cannot join the activity.'}
    try:
        min_age = act["min_age"]
    except:
        min_age = 0
    try:
        max_age = act["max_age"]
    except:
        max_age = 10000
    try:
        gen = act["sex_requirement"]
    except:
        gen = "unlimit"
    try:
        max_size = act["max_size"]
    except:
        max_size = 1000
    try:
        deadline = act["applyend_date"]
    except:
        deadline = "9999-99-99T99:99"
    r = idp_client.admin_get_user(UserPoolId=DEFAULT_USER_POOL_ID,Username=userId)
    item = {}
    for attr in r['UserAttributes']:
        if attr['Name'] == 'gender':
            item['gender'] = attr['Value']
        elif attr['Name'] == 'custom:age':
            item['age'] = attr['Value']
    if int(item['age']) > int(max_age) or int(item['age']) < int(min_age):
       return {'Error': 'Not satisfy age requirement.'}
    if item['gender'] != 'female' and ("woman" in gen):
       return {'Error': 'Not satisfy gender requirement.'}
    if item['gender'] != 'male' and ("only for man" in gen):
       return {'Error': 'Not satisfy gender requirement.'}
    try:
        user_list = act_table.get_item(Key={"id": act_id})['Item']['userlist']
    except:
        user_list = []
    if len(user_list) == max_size:
        return {'Error': 'The quota is full.'}
    if userId in user_list:
       return {'Error': 'You have already joined the activity.'}
    print(deadline)
    print(datetime.datetime.now().strftime("%Y-%m-%dT%H:%M"))
    if datetime.datetime.now().strftime("%Y-%m-%dT%H:%M") > deadline:
        return {'Error': 'The application deadlien has passed.'}
    try:
        act_table.update_item(Key={"id": act_id},
            UpdateExpression="set #userlist=list_append(if_not_exists(#userlist, :empty_list), :user)",
            ExpressionAttributeNames={'#userlist': "userlist"},
            ExpressionAttributeValues={':user': [userId], ':empty_list': []},
            ReturnValues="UPDATED_NEW")
        attd_table.update_item(Key={"userid": userId},
            UpdateExpression="set #actlist=list_append(if_not_exists(#actlist, :empty_list), :act)",
            ExpressionAttributeNames={'#actlist': "activitylist"},
            ExpressionAttributeValues={':act': [act_id], ':empty_list': []},
            ReturnValues="UPDATED_NEW")
    except:
        return {'Error': 'Cannot join activity.'}
    return {'Success': 'Congratulations.'}
