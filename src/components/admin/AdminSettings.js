import React from "react";
import "./AdminSettings.css";
import firebase from "../../firebase";
import { Select, notification, Popconfirm, Space, Form } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import Avatar from "antd/lib/avatar/avatar";

class AdminSettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			users: [],
			admins: [],
			existingAdmins: [],
			settings: {
				manyToOne: true,
			},
		};

		this.updateAdmins = this.updateAdmins.bind(this);
	}

	componentDidMount() {
		this.usersListener = firebase
			.database()
			.ref("users")
			.on(
				"value",
				function (snapshot) {
					if (typeof snapshot !== "undefined" && snapshot.val() !== null) {
						var users = [];
						for (var uid in snapshot.val()) {
							users.push({
								uid: uid,
								name: snapshot.val()[uid].name,
								email: snapshot.val()[uid].email,
								photoURL: snapshot.val()[uid].photoURL,
							});
						}
						this.setState(
							{ users: users },
							function () {
								this.adminsListener = firebase
									.database()
									.ref("admins")
									.on(
										"value",
										function (snapshot) {
											if (
												typeof snapshot !== "undefined" &&
												snapshot.val() !== null
											) {
												var admins = [];
												var existingAdmins = [];

												for (let uid in snapshot.val()) {
													for (let user of this.state.users) {
														if (user.uid === uid) {
															if (snapshot.val()[uid]) {
																admins.push({
																	uid: uid,
																	name: user.name,
																	email: user.email,
																	photoURL: user.photoURL,
																});
															}
															existingAdmins.push({
																uid: uid,
																name: user.name,
																email: user.email,
																photoURL: user.photoURL,
															});

															break;
														}
													}
												}
												this.setState({
													admins: admins,
													existingAdmins: existingAdmins,
												});
											}
										}.bind(this)
									);
							}.bind(this)
						);
					}
				}.bind(this)
			);

		this.settingsListener = firebase
			.database()
			.ref("settings")
			.on(
				"value",
				function (snapshot) {
					if (typeof snapshot !== "undefined" && snapshot.val() !== null) {
						this.setState({ settings: snapshot.val() });
					}
				}.bind(this)
			);
	}

	componentWillUnmount() {
		this.usersListener && this.usersListener();
		this.usersListener = undefined;

		this.adminsListener && this.adminsListener();
		this.adminsListener = undefined;
		this.usersListener = undefined;

		this.settingsListener && this.settingsListener();
		this.settingsListener = undefined;
	}

	updateAdmins(values) {
		var update = {};

		for (var admin of this.state.existingAdmins) {
			update[admin.uid] = false;
		}
		for (var uid of values) {
			update[uid] = true;
		}

		if (update[firebase.auth().currentUser.uid]) {
			firebase
				.database()
				.ref("admins")
				.set(update)
				.catch(function (error) {
					notification.open({
						type: "error",
						message: error.toString(),
					});
				});
		} else {
			notification.open({
				type: "warning",
				message: "You can't demote yourself!",
				description: "Instead, please delete your account.",
			});
		}
	}

	render() {
		return (
			<>
				<div className="admin-settings-section">
					<h1 className="admin-settings-sectionTitle">Profile</h1>
					<div style={{ display: "flex", flexDirection: "row" }}>
						<Avatar
							src={firebase.auth().currentUser.photoURL}
							size={180}
							style={{ marginRight: "30px" }}
						/>

						<div style={{ flexGrow: 1 }}>
							<p style={{ fontSize: "1.5em" }}>
								Hey <strong>{firebase.auth().currentUser.displayName}</strong>!
							</p>
							<p style={{ margin: 0 }}>
								<strong>Email address: </strong>
								{firebase.auth().currentUser.email}
							</p>
							<p style={{ margin: 0 }}>
								<strong>Admin? </strong>yup
							</p>
							<p style={{}}>
								<strong>Loves burritos🌯? </strong>yeah, i think so
							</p>
							<Popconfirm
								title={
									<p>
										Are you sure you want to delete{" "}
										{firebase.auth().currentUser.displayName}'s account?
										<br />
										You will no longer have access to anything!
									</p>
								}
								okText={"Yes, delete from my account"}
								cancelText="Cancel"
								onConfirm={() => {
									Promise.all([
										firebase
											.database()
											.ref("users/" + firebase.auth().currentUser.uid)
											.set(null),
										firebase
											.database()
											.ref("admins/" + firebase.auth().currentUser.uid)
											.set(false),
									]).then(function () {
										firebase
											.auth()
											.signOut()
											.then(function () {
												notification.open({
													type: "success",
													message: "Your account has been deleted",
												});
											});
									});
								}}
							>
								<a style={{ color: "red" }} href="#">
									Delete Account
								</a>
							</Popconfirm>
						</div>
					</div>
				</div>
				<div className="admin-settings-section">
					<h1 className="admin-settings-sectionTitle">Admins</h1>
					<Select
						mode="tags"
						placeholder="Select Admins"
						style={{ width: "100%" }}
						onChange={this.updateAdmins}
						value={function () {
							var admins = [];
							for (var admin of this.state.admins) {
								admins.push(admin.uid);
							}
							return admins;
						}.bind(this)()}
						size="large"
					>
						{this.state.users.map((user) => (
							<Select.Option key={user.uid} value={user.uid}>
								<Space>
									<Avatar src={user.photoURL} size={20} />
									<p style={{ margin: 0 }}>
										<strong>{user.name}</strong> ({user.email})
									</p>
								</Space>
							</Select.Option>
						))}
					</Select>
					<p style={{ marginTop: "5px" }}>
						Only admins have access to create and edit forms. To add an admin,
						please have them create an account by visiting{" "}
						<code>
							{window.location.protocol +
								"//" +
								window.location.hostname +
								(window.location.port ? ":" + window.location.port : "") +
								"/admin"}
						</code>
						. Afterwards, their account will be displayed in the list of
						authenticated users above. All admins have full access and are able
						to add/remove other admins.
					</p>
				</div>
				<div className="admin-settings-section">
					<h1 className="admin-settings-sectionTitle">Settings</h1>
					<Form.Item
						label="Many To One"
						help="If a form is allowed to have multiple Custom URLS."
					>
						<Select
							onChange={(value) => {
								firebase.database().ref("settings/manyToOne").set(value);
							}}
							value={this.state.settings.manyToOne}
						>
							<Select.Option key="allow" value={true}>
								Allow
							</Select.Option>
							<Select.Option key="disallow" value={false}>
								Disallow
							</Select.Option>
						</Select>
					</Form.Item>
				</div>
				<div className="admin-settings-section">
					<h1 className="admin-settings-sectionTitle">About</h1>
					<div
						className="admin-settings-aboutFlex"
						style={{
							display: "flex",
							flexDirection: "row",
						}}
					>
						<div className="admin-settings-aboutLeft">
							<p>
								Form Burrito hides the ugly URLs created by Google Forms,
								Typeform, and other form providers by ✨wrapping✨ it in your
								own beautiful, custom burrito🌯 (ahem... i meant domain). Need a
								more technical explination? It seamlessly iframes your forms on
								your domain and gives you can easy way for you (and your team)
								to manage them!
							</p>
							<p>
								Form Burrito is created by{" "}
								<a href="https://garytou.com">
									<strong>Gary Tou</strong>
								</a>
								! Check out this project on{" "}
								<a href="https://github.com/garytou2/Form-Burrito">
									GitHub <GithubOutlined />
								</a>
							</p>
						</div>
						<div style={{ textAlign: "center" }}>
							<img
								src="./logo.png"
								alt="Form Burrito Logo"
								style={{ width: "100%", marginBottom: "15px" }}
								draggable={false}
							/>
							<p style={{ fontSize: ".8em", fontStyle: "italic" }}>
								A portion of Form Burrito's logo contains an asset designed by{" "}
								<a href="https://www.freepik.com/">Freepik</a>
							</p>
						</div>
					</div>
				</div>
			</>
		);
	}
}

export default AdminSettings;
