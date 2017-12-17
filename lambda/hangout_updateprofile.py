import boto3
import botocore.exceptions as err

def lambda_handler(event, context):
    idp_client = boto3.client('cognito-idp')
    try:
        idp_client.update_user_attributes(
            UserAttributes=[{
                'Name': 'nickname',
                'Value': event['nickname']
            },{
                'Name': 'gender',
                'Value': event['gender']
            },{
                'Name': 'custom:phone',
                'Value': event['phone']
            },{
                'Name': 'custom:age',
                'Value': event['age']
            }],
            AccessToken=event['token']
            )
    except err.ClientError as e:
        if e.response['Error']['Code'] == 'NotAuthorizedException':
            return {'Error': 'NotAuthorizedException'}
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            if 'custom:age' in e.response['Error']['Message']:
	            return {'Error': 'InvalidAgeNumber'}
            else:
                return {'Error': 'Unknown'}
    return {'Success': 'Update success!'}
