fileName="pack_$(date "+%m-%d_%H_%M").zip"
rm ${fileName} 
zip   -r ${fileName}   icons app.js manifest.json
 