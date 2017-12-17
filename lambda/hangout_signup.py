import boto3
import botocore.exceptions as err
import os

DEFAULT_USER_POOL_APP_ID = os.environ.get('DEFAULT_USER_POOL_APP_ID')

def lambda_handler(event, context):
    if event['password'] != event['password2']:
        return {'Error': 'PasswordMatchException'}
    idp_client = boto3.client('cognito-idp')
    try:
        user = idp_client.sign_up(ClientId=DEFAULT_USER_POOL_APP_ID,
                                Username=event['username'],
                                Password=event['password'],
                                  UserAttributes=[{
                                        'Name': 'email',
                                        'Value': event['username']
                                  },{
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
                                  }])
        return user
    except err.ParamValidationError:
	    return {'Error': 'PasswordException'}
    except err.ClientError as e:
	    if e.response['Error']['Code'] == 'UsernameExistsException':
		    return {'Error': 'UsernameExistsException'}
	    elif e.response['Error']['Code'] == 'InvalidParameterException':
	        if 'email' in e.response['Error']['Message']:
	            return {'Error': 'InvalidEmailAddress'}
	        elif 'custom:age' in e.response['Error']['Message']:
	            return {'Error': 'InvalidAgeNumber'}
		    return {'Error': 'InvalidParameterException'}
	    else:
		    return {'Error': 'UnknownException'}
