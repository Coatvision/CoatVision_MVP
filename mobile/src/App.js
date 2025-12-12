// mobile/src/App.js
// v2
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraScreen from "./screens/CameraScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          title: "CoatVision",
        }}
      >
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{ title: "Coating Analysis" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
