var ldap = require('ldapjs');
const moment = require('moment');
require('dotenv').config();

//ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;



const loginGet = (req, res) => {

  res.render('login-form');
  console.log('Requested page: ' + req.url);

};


const loginPost = (req, res) => {

  console.log('Login Form post body - trying to authenticate user:', req.body.user);
  if (!req.body.user || !req.body.passwd) {
    console.log("Kein user oder passwort eingegeben");
    res.render('login-form', {
      loggedin: "false"
    })
  } else {



    authenticate(req.body.user, req.body.passwd, function(ret) {
      //  console.log("LDAP Result: ", ret);
      if (ret) {
        console.log("LDAP successfully Returned username: ", ret.sAMAccountName);

        let m = moment().format('YYYY-MM-DD hh:mm:ss');
        let sessionTime = moment().add(process.env.SESSIONDURATION, 'minutes').format('YYYY-MM-DD hh:mm:ss');
        console.log('Current Time at: ', m)
        console.log('calculated session Time at: ', sessionTime)


        req.session.user = ret.sAMAccountName;
        req.session.admin = true;
        req.session._expires = sessionTime;

        res.redirect("/entries");

      } else {
        console.log("not authenticated  returned: ", ret);
        res.render('login-form', {
          loggedin: "false"
        })
        //  res.redirect("/entries");
      }

    })
  }

}

const authenticate = (username, password, callback) => {

  console.log('--- going to try to connect user ---');

  var authenticated = "init";
  // Define LDAP client connection setting
  var opts = {
    filter: '(&(objectclass=user)(samaccountname=' + username + '))',
    scope: 'sub',
    //attributes: ['objectGUID']
    // This attribute list is what broke your solution
    attributes: ['objectGUID', 'sAMAccountName', 'cn', 'mail', 'manager', 'memberOf']
  };



  var ldap_client_object = {
    //url: 'ldap://192.168.0.1:389/',
    //url: 'ldap://127.0.0.1:389/',
    url: process.env.LDAPURL,
    //url: 'ldap://192.168.1.245:389/',
    connectTimeout: 2000,
    timeout: 5000,
  };

  // Create LDAP client connection
  var client = ldap.createClient(ldap_client_object);

  // Register a LDAP client connection "error" handler
  client.on('error', function(err) {
    // The LDAP client connection has generated an error...
    console.log("LDAP Connection Error: ", err.message);
  });

  // Register a LDAP client connection "connectTimeout" handler
  client.on('connectTimeout', function(err) {
    // The ldap connection attempt has been timed out...
    console.log("LDAP Connection Error: ", err.message);
  });

  // Register a LDAP client connection "connect" handler
  client.on('connect', function() {
    // The ldap connection is ready to use. Place your subsequent ldapjs code here...
    //console.log("LDAP Connection Ready: ",client.url["url"] );
    console.log("LDAP Connection Ready: ", client.url["href"]);
  });


  try {
    client.bind(username, password, function(error) {
      if (error) {
        console.log("LDAP Bind error: ", error.message);
        console.log("LDAP Error text: ", ldapErrorMeesage(error.message));
        callback(null);
        client.unbind(function(error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('ldap client disconnected');
          }
        });
      } else {
        console.log('connected');
        client.search(process.env.LDAPSEARCHBASE, opts, function(error, search) {
          console.log('Searching.....');

          //Suche nach dem benutzer im LDAP
          search.on('searchEntry', function(entry) {
            if (entry.object) {

              // Prüfe, ob der User Mitglied der AD-Gruppe ist
              //  console.log("LDAP Gruppen: ", entry.object["memberOf"]);
              var memberOf = JSON.stringify(entry.object["memberOf"]);
              if (memberOf.search("CN=" + process.env.LDAPGROUPMEMBER + ",") === -1) {
                console.log("User ist nicht Mitglied der AD Gruppe ", process.env.LDAPGROUPMEMBER, " Result: ", memberOf.search("CN=" + process.env.LDAPGROUPMEMBER + ","));
                callback(null);
              } else {
                console.log("User ist Mitglied der AD Gruppe ", process.env.LDAPGROUPMEMBER, " Result: ", memberOf.search("CN=" + process.env.LDAPGROUPMEMBER + ","));
                authenticated = entry.object;
                callback(authenticated);

              }








              //console.log('entry: %j ' + authenticated);
            }
            client.unbind(function(error) {
              if (error) {
                console.log(error.message);
              } else {
                console.log('ldap client disconnected');
              }
            });
          });

          search.on('error', function(error) {
            console.error('error: ' + error.message);
            client.unbind(function(error) {
              if (error) {
                console.log(error.message);
              } else {
                console.log('client disconnected');
              }
            });
          });

          // don't do this here
          //client.unbind(function(error) {if(error){console.log(error.message);} else{console.log('client disconnected');}});
        });
      }
    });


  } catch (error) {
    console.log(error);
    client.unbind(function(error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('client disconnected');
      }
    });
  }

};

function ldapErrorMeesage(_errMsg) {
  //console.log("ldap error converter got: ", _errMsg);

  var posOfDataString = _errMsg.search("data ");
  var actualErrCode = _errMsg.substring(posOfDataString + 5, posOfDataString + 8);
  console.log("\r\nldap error converter extracted error code: ", actualErrCode);

  switch (actualErrCode) {

    case 525:
      return "User not found"
      break;
    case "52e":
      return "Invalid credentials"
      break;
    case 530:
      return "Not permitted to logon at this time"
      break;
    case 531:
      return "Not permitted to logon from this workstation"
      break;
    case 532:
      return "Password expired"
      break;
    case 533:
      return "Account disabled"
      break;
    case 701:
      return "Account expired"
      break;
    case 773:
      return "User must reset password"
      break;
    case 775:
      return "Account locked out"
      break;
    default:
      return "Unknown LDAP error"
      break;
  }
}
module.exports = {
  loginGet,
  loginPost
};
