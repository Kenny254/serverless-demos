#!/bin/bash

# *** replace PROJECT_NAME with your project, and PROJECT_REGION with the firebase region
YOUR_HTTP_TRIGGER_ENDPOINT="http://localhost:5000/PROJECT_NAME/PROJECT_REGION/posts"

# this should be successful
curl -X POST -H "Content-Type:application/json"  -d '{ "title" : "this is the post title", "content" : "this is the development post content"}' $YOUR_HTTP_TRIGGER_ENDPOINT

echo ""

# this should fail, as content is empty
curl -X POST -H "Content-Type:application/json"  -d '{ "title" : "No content provided" }' $YOUR_HTTP_TRIGGER_ENDPOINT

echo ""

# this should succeed with the title filled in with the first part of the content
curl -X POST -H "Content-Type:application/json"  -d '{ "content": "this is my content without a title" }' $YOUR_HTTP_TRIGGER_ENDPOINT

