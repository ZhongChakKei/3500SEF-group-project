This ZIP contains the Lambda Function URL API code (index.mjs) and package.json.

IMPORTANT: node_modules are NOT included. Before uploading to Lambda:
1) Unzip locally
2) Run: npm i
3) Zip the contents (index.mjs + package.json + node_modules) for deployment
   - If you zip the CONTENTS (files at root): handler = index.handler
   - If you zip the FOLDER: handler = <folder-name>/index.handler

Environment variables (Lambda):
TABLE_NAME=dist-inventory
ALLOWED_ORIGIN=*
REQUIRE_AUTH=false
OAUTH_ISSUER=https://cognito-idp.us-east-2.amazonaws.com/<UserPoolId>
REQUIRED_SCOPES=read.inventory,reserve.stock

Create a Function URL with auth type NONE and CORS allowing your frontend origin.
Later set REQUIRE_AUTH=true to enforce Cognito JWT.
