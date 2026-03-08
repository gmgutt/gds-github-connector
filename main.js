var cc = DataStudioApp.createCommunityConnector();

function myFunction() {

  let request = {
    'key': ''
  };

  setCredentials(request);
  getData(request);
}

function setCredentials(request) {

  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('gh.key', request.key);

  let error = isAuthValid() ? 'NONE' : 'INVALID_CREDENTIALS';

  return {
    'errorCode': error
  }
}

function isAuthValid() {
  const userProperties = PropertiesService.getUserProperties();
  const key = userProperties.getProperty("gh.key");
  return !!key;
}

function resetAuth() {
  userProperties.setProperty('gh.key', '');
}

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.KEY)
    .build();
}

function getConfig() {
  return cc.getConfig().build();
}

function getFields() {

  var fields = cc.getFields();
  fields.newDimension()
    .setId('repo')
    .setName('Repository')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('user')
    .setName('User')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('merged')
    .setName('Date Merged')
    .setType(cc.FieldType.YEAR_MONTH_DAY);
  fields.newDimension()
    .setId('title')
    .setName('Title')
    .setType(cc.FieldType.TEXT);
  
  return fields;
}

function getSchema(request) {

  return {
    schema: getFields().build()
  };
}

function getData(request) {

  let requestedFields = request.fields.map(function(field) { return field.name; });

  let a = parseRepo('mpstls-ui-navigator', requestedFields);
  let b = parseRepo('mpstls-api-navigator', requestedFields);
  let c = parseRepo('mpstls-logs-navigator', requestedFields);
  let d = parseRepo('playwrightAPINav', requestedFields);

  return {
    'schema': getFields().forIds(requestedFields).build(),
    'rows': a.concat(b).concat(c).concat(d),
    'filterApplied': false
  }
}

function parseRepo(repo, fields) {

  const userProperties = PropertiesService.getUserProperties();
  const creds = userProperties.getProperty("gh.key");

  let csv = '';

  let lastCount = 100;
  let rows = [];

  for (var page = 1; lastCount > 0; page++) {
    var url = `https://api.github.com/repos/mckesson/${repo}/pulls?state=closed&per_page=100&page=${page}`;
    var options = {
      'headers': {
        'Authorization': `Bearer ${creds}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Accept': 'application/vnd.github+json'
      }
    }

    var response = UrlFetchApp.fetch(url, options);
    var json = response.getContentText();
    var data = JSON.parse(json);

    lastCount = data.length;

    let jsonData = data.filter(pr => !!pr.merged_at);
    const userCount = new Map();
    for (i = 0; i < jsonData.length; i++) {
        let pr = jsonData[i];
        let user = pr?.user?.login;

        // let row = `${repo}, ${user}, ${pr.merged_at.substring(0,10).replace('-','')}, ${pr.title}`;
        // console.log(row);

        // let row = Array.of(repo, user, pr.merged_at.substring(0,10).replaceAll('-',''));
        // if (fields.includes('title')) {
        //   row.push(pr.title);
        // }

        let row = fields.map(function(fieldName) {
          switch (fieldName) {
            case 'repo': return repo;
            case 'user': return user;
            case 'merged': return pr.merged_at.substring(0,10).replaceAll('-','');
            case 'title': return pr.title;
          }
        });

        rows.push({'values': row});
    }
  }

  return rows;
}

function isAdminUser() {
  return true;
}
