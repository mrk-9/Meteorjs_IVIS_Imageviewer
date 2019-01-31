# Install 
```bash
$ curl https://install.meteor.com/ | sh
$ meteor npm install --save loglevel babel-runtime url
$ a2enmod proxy_wstunnel proxy proxy_http
```

Enter OHIFViewer directory, and install following packages:
```bash
METEOR_PACKAGE_DIRS="../Packages" meteor add chrismbeckett:toastr cultofcoders:persistent-session templates:array --allow-superuser
```

#### Apache Config Additions: #### 
```
# ImageViewer Config
RewriteEngine On
RewriteCond %{HTTP:UPGRADE} ^WebSocket$ [NC]
RewriteCond %{HTTP:CONNECTION} Upgrade$ [NC]
RewriteRule .* ws://localhost:3000%{REQUEST_URI} [P]
        
ProxyPass /imageviewer http://localhost:3000/imageviewer/
ProxyPassReverse /imageviewer http://localhost:3000/imageviewer/
```
    
#### Run Orthanc (PACS)
```bash
$ docker run -d --restart=always -p 104:104 -p 8043:8043 -v /var/www/html/scriptsender/config/orthanc.json:/etc/orthanc/orthanc.json:ro -v /tmp/orthanc/:/var/lib/orthanc/db/ jodogne/orthanc-plugins
```
With this command, Orthanc runs on port 8043, uses the config file orthanc.json, and stores images under /tmp/orthanc.

#### Enable
```bash
$ redis-cli hset ss_env "enable_image_viewer" 1
```
* config/settings.php > remotePACS > enable_QR to `true`.
* Set remaining paramters in `remotePACS`.

#### Configuration (config/orthancDICOMWeb.json)
```json
"wadoUriRoot": "http://localhost:8043/wado",
"qidoRoot": "http://localhost:8043/dicom-web",
"wadoRoot": "http://localhost:8043/dicom-web",
.
.
.
"apiRoot": "https://ss.nrsmed.com/api",
```
#### Fix Cornerstone rendering issue on specific iphones (iphone 5, 5s, 6+, 7+ and brand XS Max)
```Install ReactiveArray package
$ cd OHIFViewer
$ meteor add manuel:reactivearray
Reference: https://atmospherejs.com/manuel/reactivearray
```
```Change 
-> 'window.innerWidth' to 'document.body.getBoundingClientRect().width' on source code
An approach might be to use document.body.getBoundingClientRect().width as an alternative to window.innerWidth and/or window.outerWidth. screen.width could also be used, however, these could also have the same issues as your previous methods.
This might be due to an ongoing bug with iOS 10.

-> Change code on imageViewerViewport.js file as below 
var ctx = document.getElementsByClassName("markerPenCanvas").getContext("2d"); as an alternative to var ctx = event.target.getContext("2d");
There is no need to use pfil action based on canvas on cordinate calculation
```
```Change 
Meteor's settings for 'public.ui.cornerstoneRenderer' to 'canvas' in your configuration file? If you could provide an anonymized version the image, it would 
   be helpful.

```
```Test 
Before test, clear all cashes on testing browser.
```

# Run (Dev)
```bash
$ cd OHIFViewer
$ METEOR_PACKAGE_DIRS="../Packages" ROOT_URL=http://localhost:3000/imageviewer meteor --settings ../config/orthancDICOMWeb.json --allow-superuser
```
If run standalone, i.e. without Laravel as proxy, open port 3000: `ufw allow 3000/tcp`

# Run (Production)
```bash
$ cd OHIFViewer
$ METEOR_PACKAGE_DIRS="../Packages" ROOT_URL=http://localhost:3000/imageviewer nohup meteor --settings ../config/orthancDICOMWeb.json --allow-superuser --production > /var/log/scriptsender/meteor.log 2>&1 &
```