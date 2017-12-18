import boto3
import os

DEFAULT_USER_POOL_ID = os.environ.get('DEFAULT_USER_POOL_ID')
db = boto3.resource("dynamodb")
act_table = db.Table("Hangout-activity")
idp_client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    act_id = event['act_id']
    try:
        res = act_table.get_item(Key={"id": act_id})
        userlist = res['Item']['userlist']
    except:
        userlist = []
    ret = []
    for user in userlist:
        try:
            response = idp_client.admin_get_user(UserPoolId=DEFAULT_USER_POOL_ID,Username=user)
            item = {}
            for attr in response['UserAttributes']:
                if attr['Name'] == 'custom:phone':
                    item['phone'] = attr['Value']
                elif attr['Name'] == 'gender':
                    item['gender'] = attr['Value']
                elif attr['Name'] == 'nickname':
                    item['nickname'] = attr['Value']
                elif attr['Name'] == 'custom:age':
                    item['age'] = attr['Value']
                elif attr['Name'] == 'email':
                    item['email'] = attr['Value']
            ret.append(item)
        except:
            pass
    return {"users": ret}
