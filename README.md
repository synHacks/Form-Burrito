# Form Burrito (WIP)

Seamless custom domains/urls for your Typeforms and Google Forms.

A React app that embeds your forms on your domain and uses Firebase for auth and database.

## Firebase Realtime Database

**Rules**

```json
{
	"rules": {
		".read": false,
		".write": false,
		"urls": {
			".read": true,
			".write": "auth != null && root.child('admins/' + auth.uid).exists() && root.child('admins/' + auth.uid).val() === true",
			"$pushKey": {
				".validate": "newData.hasChildren(['short', 'full', 'type', 'time'])"
			}
		},
		"admins": {
			".read": "auth != null",
			".write": "!root.child('admins').exists() || (auth != null && root.child('admins/' + auth.uid).exists() && root.child('admins/' + auth.uid).val() === true)",
			"$uid": {
				".validate": "newData.val() === true || newData.val() === false"
			}
		},
		"users": {
			".read": "auth != null && root.child('admins/' + auth.uid).exists() && root.child('admins/' + auth.uid).val() === true",
			".write": false,
			"$uid": {
				".write": "auth != null && $uid === auth.uid",
				".read": "auth != null && $uid === auth.uid"
			}
		},

		"settings": {
			".read": "auth != null && root.child('admins/' + auth.uid).exists() && root.child('admins/' + auth.uid).val() === true",
			".write": "auth != null && root.child('admins/' + auth.uid).exists() && root.child('admins/' + auth.uid).val() === true"
		}
	}
}
```

Portion of Burrito in Logo is designed by [Freepik](www.freepik.com)

https://www.freepik.com/free-vector/kawaii-fast-food-cute-burrito-taco_5769136.htm#page=1&query=burrito&position=6

---

<a href="https://vercel.com/?utm_source=synhacks&utm_campaign=oss"><img src="https://user-images.githubusercontent.com/20099646/92321071-ca5a1900-efdb-11ea-88ab-8f4950974da0.png" alt="Powered by Vercel"/></a>

