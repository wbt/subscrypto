import json
import os, re, base64
import boto3
import requests
 
def lambda_handler(event, context):
    
    mypage = page_router(event['httpMethod'],event['queryStringParameters'],event['body'])
    
    return mypage


def page_router(httpmethod,querystring,formbody):

    if httpmethod == 'GET':
        htmlFile = open('usage.html', 'r')
        htmlContent = htmlFile.read()
        return {
        'statusCode': 200, 
        'headers': {"Content-Type":"text/html"},
        'body': htmlContent
        }
    
    if httpmethod == 'POST':
        
        insert_record(formbody)
        check_threshold(formbody)
        
        htmlFile = open('status.html', 'r')
        htmlContent = htmlFile.read()
        return {
        'statusCode': 200, 
        'headers': {"Content-Type":"text/html"},
        'body': htmlContent
        }   


def insert_record(formbody):
    
    formbody = formbody.replace("=", "' : '")
    formbody = formbody.replace("&", "', '")
    formbody = "INSERT INTO usage3 value {'" + formbody +  "'}"
    
    client = boto3.client('dynamodb')
    client.execute_statement(Statement= formbody)
    
        
def check_threshold(formbody):
    
    client = boto3.client('dynamodb')
    response = client.get_item(
    TableName='subscriptions3',
    Key={
        'accountId': {'S': 'abc'}
    },
    ProjectionExpression='threshold'
    )
    
    print(f'formbody: {formbody}')
    usage = formbody.split('usage')
    usage = int(usage[1].replace("=", ""))
    print(f'usage: {usage}')
    
    if 'Item' in response:
        threshold = int(response['Item']['threshold']['S'])
        print(f'threshold: {threshold}')
        if usage > threshold:
            print('threshold exceeded')
            check_paid_tier(formbody)
    else:
        print('Item not found')
    


def check_paid_tier(formbody):
    
    client = boto3.client('dynamodb')
    response = client.get_item(
    TableName='subscriptions3',
    Key={
        'accountId': {'S': 'abc'}
    },
    ProjectionExpression='tier'
    )
    
    
    if 'Item' in response:
        tier = response['Item']['tier']['S']
        print(f'tier: {tier}')
        confirm_tier(tier)
    else:
        print('Item not found')
        
        
        
def confirm_tier(tier):
    
    # Replace this URL with the API endpoint you want to query
    url = "https://jsonplaceholder.typicode.com/posts/1"
 
    # Make the HTTP GET request
    try:
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            userId = data['userId']
            print(f'userId: {userId}')
            #return {
            #    'statusCode': 200,
            #    'body': json.dumps(data)
            #}
        else:
            return {
                'statusCode': response.status_code,
                'body': "Failed to fetch data"
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }