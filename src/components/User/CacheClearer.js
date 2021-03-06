import db, {firebaseInitializeApp}  from '../../config/DBConnection';


export default async (reload = true) => {
	await db.auth(firebaseInitializeApp).signOut()
	await caches.keys().then((keys) => {
		for (let key of keys) {
			caches.delete(key).then((res) => {
				console.log(res);
			});
		}
		localStorage.clear();
		sessionStorage.clear();
	});
};
