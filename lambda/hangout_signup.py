import boto3
import botocore.exceptions as err
import os

DEFAULT_USER_POOL_APP_ID = os.environ.get('DEFAULT_USER_POOL_APP_ID')

def lambda_handler(event, context):
    idp_client = boto3.client('cognito-idp')
    try:
        user = idp_client.sign_up(ClientId=DEFAULT_USER_POOL_APP_ID,
                                Username=event['username'],
                                Password=event['password'],
                                  UserAttributes=[{
                                      'Name': 'email',
                                      'Value': event['username']
                                  }])
        return user
    except err.ParamValidationError:
	    return {'Error': 'PasswordException'}
    except err.ClientError as e:
	    if e.response['Error']['Code'] == 'UsernameExistsException':
		    return {'Error': 'UsernameExistsException'}
	    elif e.response['Error']['Code'] == 'InvalidParameterException':
		    return {'Error': 'InvalidParameterException'}
	    else:
		    return {'Error': 'UnknownException'}
