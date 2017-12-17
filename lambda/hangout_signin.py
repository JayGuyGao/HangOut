import boto3
import botocore.exceptions as err
import os

ACCOUNTID = os.environ.get('ACCOUNTID')
IDENTITYPOOLID = os.environ.get('IDENTITYPOOLID')
DEFAULT_USER_POOL_ID = os.environ.get('DEFAULT_USER_POOL_ID')
DEFAULT_USER_POOL_APP_ID = os.environ.get('DEFAULT_USER_POOL_APP_ID')
DEFAULT_USER_POOL_LOGIN_PROVIDER = os.environ.get('DEFAULT_USER_POOL_LOGIN_PROVIDER')

def lambda_handler(event, context):
    idp_client = boto3.client('cognito-idp')
    #ci_client = boto3.client('cognito-identity')
    try:
	    user = idp_client.admin_initiate_auth(UserPoolId=DEFAULT_USER_POOL_ID,
                                       AuthFlow='ADMIN_NO_SRP_AUTH',
                                       ClientId=DEFAULT_USER_POOL_APP_ID,
                                       AuthParameters={'USERNAME':event['username'],
                                                       'PASSWORD':event['password']}
                                       )
    except err.ClientError as e:
	    if e.response['Error']['Code'] == 'NotAuthorizedException':
		    return {'Error': 'NotAuthorizedException'}
	    elif e.response['Error']['Code'] == 'UserNotFoundException':
		    return {'Error': 'UserNotFoundException'}
	    else:
		    return {'Error': 'UnknownSigninException'}
    try:
        #res = ci_client.get_id(AccountId=ACCOUNTID,
        #                IdentityPoolId=IDENTITYPOOLID,
        #                Logins={
        #                    DEFAULT_USER_POOL_LOGIN_PROVIDER:user['AuthenticationResult']['IdToken']
        #                })
        res = idp_client.get_user(AccessToken=user['AuthenticationResult']['AccessToken'])
        ret = {}
        for item in res['UserAttributes']:
            if item['Name'] == 'sub':
                ret['id'] = item['Value']
            elif item['Name'] == 'email':
                ret['email'] = item['Value']
        return {'user': user, 'res': ret}
    except err.ClientError as e:
        if e.response['Error']['Code'] == 'TooManyRequestsException':
            return {'Error': 'TooManyRequestsException'}
        else:
            return {'Error': 'UnknownGetIdException'}
