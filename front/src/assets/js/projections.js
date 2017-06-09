//lambert 93
proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
//lambert 2 Entendu
proj4.defs("EPSG:27572", "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs");
//UTM N20
proj4.defs("SR-ORG:7407", "+proj=utm +zone=20 +ellps=WGS84 +units=m +no_defs");
//UTM N22
proj4.defs("EPSG:2972", "+proj=utm +zone=22 +ellps=GRS80 +towgs84=2,2,-2,0,0,0,0 +units=m +no_defs");
//UTM S40
proj4.defs("EPSG:2975", "+proj=utm +zone=40 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
//UTM S38
proj4.defs("SR-ORG:6892", "+proj=eqc +lat_ts=-12 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0.0000,0.0000,0.0000,0,0,0,0 +units=m +no_defs");