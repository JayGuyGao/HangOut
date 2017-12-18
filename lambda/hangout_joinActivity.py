import boto3

db = boto3.resource("dynamodb")
act_table = db.Table("Hangout-activity")
attd_table = db.Table("Hangout-userattendance")

def lambda_handler(event, context):
    userId = event["userId"]
    act_id = event["activity"]["act_id"]
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

