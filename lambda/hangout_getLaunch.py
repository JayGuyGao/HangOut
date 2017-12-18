from botocore.vendored import requests

endpoint = "https://search-group6-activity-website-gv3gkyysjd5b7hnkji7hcmghzi.us-east-1.es.amazonaws.com/activities_test/activity/_search?q=(userId:\"%s\")"

def lambda_handler(event, context):
    userId = event['userId']
    r = requests.get(endpoint % userId)
    try:
        res = []
        items = r.json()["hits"]["hits"]
        for item in items:
            act = item["_source"]
            act["id"] = item["_id"]
            res.append(act)
    except:
        res = []
    return {"activities": rehaoxiangs}
