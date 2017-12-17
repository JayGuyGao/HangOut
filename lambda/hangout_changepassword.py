import boto3
import botocore.exceptions as err


def lambda_handler(event, context):
    idp_client = boto3.client('cognito-idp')
    if event['new_pass'] != event['new_pass2']:
        return {'Error': 'DiffException'}
    try:
        idp_client.change_password(
            PreviousPassword=event['old_pass'],
            ProposedPassword=event['new_pass'],
            AccessToken=event['token']
            )
    except err.ClientError as e:
        if e.response['Error']['Code'] == 'NotAuthorizedException':
            return {'Error': 'NotAuthorizedException'}
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            return {'Error': 'TokenException'}
        else:
            return {'Error': 'UnknownPasswordException'}
    except err.ParamValidationError:
        return {'Error': 'PasswordException'}
    except:
        return {'Error': 'UnknownError'}
    return {'Success': 'Password has been changed.'}
