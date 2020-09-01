// Create a firebase project. Add a web app to that project and copy the Config here
const firebaseConfig = {
	apiKey: "AIzaSyCJFdvJoIMQuiL6gFHeKJvA_mceip-35g8",
    	authDomain: "form-burrito.firebaseapp.com",
   	databaseURL: "https://form-burrito.firebaseio.com",
   	projectId: "form-burrito",
	storageBucket: "form-burrito.appspot.com",
	messagingSenderId: "781659640542",
    	appId: "1:781659640542:web:96e0619192056a4472a84f",
   	measurementId: "G-8HP8R9M5M9"
};

const config = {
	firebaseConfig: firebaseConfig,
	homeRedirect: "https://synhacks.org", //redirects to this URL if you visit the home page
	entityName: "synHacks", //The name of your business, organization, or your own name!
};

//Also, feel free to change /public/favicon.png to your own logo

export default config;
