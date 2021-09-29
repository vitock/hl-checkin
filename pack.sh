fileName="package_$(date "+%m-%d_%H_%M_%S").zip"
rm package_* 
zip   -r ${fileName}   icons app.js style.css manifest.json
 