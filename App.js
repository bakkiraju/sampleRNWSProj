'use strict';

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import testRunner from './testRunner';

import {
  createStackNavigator,
} from 'react-navigation';

const App = createStackNavigator({
  Home: { screen: testRunner }
});
export default App;

