import React, { Component } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList, LogBox, Button } from "react-native";

LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core and will be removed in a future release.",
]);

const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = require("./.firebaseConfig.json");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 40,
    textAlign: "center",
    padding: 20,
  },

  txtTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 30,
    marginTop: 20,
    marginBottom: 20,
  },

  txtLog: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
  },

  txtUID: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  item: {
    flex: 1,
    fontSize: 20,
    color: "blue",
  },

  text: {
    fontSize: 18,
    color: "blue",
  },
});

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shoppingLists: [],
      uid: undefined,
      loggedInText: "Please wait. You’re being authenticated",
    };

    this.onCollectionUpdate.bind(this);

    // Connect to the Database and the collection
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  componentDidMount() {
    this.referenceShoppingLists = firebase
      .firestore()
      .collection("shoppingLists");

    this.unsubscribe = this.referenceShoppingLists.onSnapshot(
      this.onCollectionUpdate
    );

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
        console.log("USER:", user);
      }

      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: "Hello there",
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onCollectionUpdate = (querySnapshot) => {
    const shoppingLists = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      shoppingLists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });

    this.setState({
      shoppingLists,
    });
  };

  addList() {
    this.referenceShoppingLists.add({
      name: "TestList",
      items: ["eggs", "pasta", "veggies"],
    });
  }

  render() {
    const { shoppingLists, loggedInText, uid } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.txtTitle}>Shopping Lists App</Text>
        <Text style={styles.txtLog}>{loggedInText}</Text>
        <Text style={styles.txtUID}>UID: {uid}</Text>
        <FlatList
          style={styles.item}
          data={shoppingLists}
          renderItem={({ item }) => (
            <Text style={styles.text}>
              {item.name}: {item.items}
            </Text>
          )}
        />
        <Button
          onPress={() => this.addList()}
          title="Add Item"
          color="#841584"
          accessibilityLabel="Add an item to the list"
        />
        <StatusBar style="auto" />
      </View>
    );
  }
}

export default App;
