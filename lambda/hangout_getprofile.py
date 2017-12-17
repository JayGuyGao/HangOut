import boto3
import botocore.exceptions as err

def lambda_handler(event, context):
    idp_client = boto3.client('cognito-idp')
    try:
        response = idp_client.get_user(AccessToken=event['token'])
        ret = {}
        for item in response['UserAttributes']:
            if item['Name'] == 'sub':
                ret['id'] = item['Value']
            elif item['Name'] == 'custom:phone':
                ret['phone'] = item['Value']
            elif item['Name'] == 'gender':
                ret['gender'] = item['Value']
            elif item['Name'] == 'nickname':
                ret['nickname'] = item['Value']
            elif item['Name'] == 'custom:age':
                ret['age'] = item['Value']
        return ret
    except:
        return {'Error': 'e'}
