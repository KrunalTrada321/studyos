import { useRoute } from "@react-navigation/native";
import React from "react";
import { Text, View } from "react-native";


function LessonStart() {
  const route = useRoute();
  const { lesson } = route.params;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        {lesson.title}
      </Text>
      <Text style={{ marginTop: 10 }}>
        {lesson.questions} Questions
      </Text>
      <Text>
        {lesson.explanations} Explanations
      </Text>
    </View>
  );
}


export default LessonStart
