var Locations = [
		  {name: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
          {name: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
          {name: 'The Monkey Bar', location: {lat: 40.759959, lng: -73.973223}},
          {name: 'Ruth\'s Chris Steak House', location: {lat: 40.761454, lng: -73.982321}},
		  {name: 'Rockfeller Plaza', location: {lat: 40.758740, lng: -73.978676}},
		  {name: 'Empire state Building', location: {lat: 40.748445,lng: -73.985670}},
		  {name: 'Shilla Restaurant', location: {lat: 40.748026,lng: -73.987274}},
		  {name: 'Korean BBQ Restautant', location: {lat: 40.747652,lng: -73.987236}},
		  {name: 'Panera Bread', location: {lat: 40.747611,lng: -73.985444}}

];

var map;

function initMap() {
    
	map = new google.maps.Map(document.getElementById('map'),{
			center:  {lat: 40.7413549, lng: -73.9980244},
			zoom: 13
	});

    ko.applyBindings(new ViewModel());
}

var LocationModel = function(data) {
    
	var self = this;

    this.name = data.name;
    this.position = data.location;
    this.street = '';
	this.city = '';
	this.phone = '';

	
    this.visible = ko.observable(true);

	var defaultIcon = makeMarkerIcon('87AFC7');
    var highlightedIcon = makeMarkerIcon('FFFF24');

	
	var clientID='DC2JZRTVOAHEEZ4KHDRDOPGMVI2OSAUPDOC3RXPMHSZOO4DD';
		
	var clientSecret='QSZ40DISRG23F3W4GZT2TNRCYBJTVBPJ2ATQCERDTH5SNEKS';
	
    // get JSON request of foursquare data
    var reqURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(reqURL).done(function(data){
			
			var results = data.response.venues[0];
			self.street = results.location.formattedAddress[0];
			self.city = results.location.formattedAddress[1];
			self.phone = results.contact.formattedPhone;
		}).fail(function(){
			//alert("The data cannot be loaded");
		});
		
	this.infoWindow = new google.maps.InfoWindow();
	
    // Create a marker per location
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.name,
        animation: google.maps.Animation.DROP,
		icon: defaultIcon
    });    

    self.filterMarkers = ko.computed(function () {
        // set marker(showListings)
        if(self.visible() === true) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
    });
    
	this.marker.addListener('click', function(){
		self.markerString = '<div id="info-window-content"><div><strong>' + data.name + '</strong></div>' +
		'<div>'+ self.street + '</div>'+
		'<div>'+ self.city + '</div>'+'<div>'+ self.phone + '</div></div>';
		
		// setting infowindow content using markerString.
		self.infoWindow.setContent(self.markerString);
		//opening infowindow for marker.
		self.infoWindow.open(map,this);
		
		bounceAnimation(this);
	});
	this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });
	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

var ViewModel = function(){
	
	var self = this;
	 
	this.searchOption = ko.observable("");

	this.placeList = ko.observableArray([]);
	
	Locations.forEach(function(locationItem){
		self.placeList.push( new LocationModel(locationItem));
	});

    this.placeLocation = ko.computed(function() {
        
		var searchfilter = self.searchOption().toLowerCase();
		if (!searchfilter) {
			self.placeList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.placeList();
		} else {
			return ko.utils.arrayFilter(self.placeList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(searchfilter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);	
};

function bounceAnimation(marker){
	if(marker.getAnimation() == null){
		
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			marker.setAnimation(null);
		}, 1000);
	}else {
		marker.setAnimation(null);		
	}
}

// icon is 21 px wide by 35 high, with origin of 0, 0 and be anchored at 12, 30.
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 35),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 30),
        new google.maps.Size(21, 35));
    return markerImage;
}
