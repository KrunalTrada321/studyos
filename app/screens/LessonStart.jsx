import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "../utils/constants";
import { getToken } from "../utils/token";

function LessonStart() {
  const route = useRoute();

  const { lessonId } = route.params;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchLessonById = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${Constants.api}/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log(data);
        setLesson(data);
      } catch (err) {
        console.error("Error fetching lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonById();
  }, [lessonId]);

  const handleAnswer = (correct) => {
    setUserAnswers((prev) => [...prev, correct]);
    setShowAnswer(true);
  };

  const handleNext = () => {
    const autoAnswerTypes = [
      "FeynmanWhy",
      "MiniMindmap",
      "Derivation",
      "AnalogyCard",
      "Highlight",
      "MatchPair",
      "ReorderList",
      "SpacedRecap",
    ];

    if (!showAnswer && autoAnswerTypes.includes(q.type)) {
      setUserAnswers((prev) => [...prev, true]); // Auto-marked as correct
    }

    setCurrentIndex((prev) => prev + 1);
    setInputValue("");
    setSelectedOption(null);
    setShowAnswer(false);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;
  if (!lesson) return <Text style={{ marginTop: 50 }}>Lesson not found</Text>;

  if (currentIndex >= lesson.quiz.length) {
    const correctCount = userAnswers.filter(Boolean).length;
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Quiz Completed!
        </Text>

        <Text>
          You got {correctCount} out of {lesson.quiz.length} correct.
        </Text>
      </View>
    );
  }

  const q = lesson.quiz[currentIndex];

  const renderByType = () => {
    switch (q.type) {
      case "MCQ":
        return Object.entries(q.options).map(([key, value]) => {
          const isCorrect = key === q.answer;
          const isSelected = key === selectedOption;
          let bg = "#f0f0f0";
          if (showAnswer) {
            if (isCorrect) bg = "#d4edda";
            else if (isSelected) bg = "#f8d7da";
          } else if (isSelected) {
            bg = "#cce5ff";
          }
          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                if (!showAnswer) {
                  setSelectedOption(key);
                  handleAnswer(isCorrect);
                }
              }}
              style={{
                backgroundColor: bg,
                padding: 10,
                marginVertical: 5,
                borderRadius: 6,
              }}
            >
              <Text>
                {key.toUpperCase()}. {value}
              </Text>
            </TouchableOpacity>
          );
        });

      case "FIB":
        return (
          <>
            {q.blanks.map((_, i) => (
              <TextInput
                key={i}
                placeholder={`Blank ${i + 1}`}
                value={inputValue[i] || ""}
                onChangeText={(text) => {
                  const updated = [...(inputValue || [])];
                  updated[i] = text;
                  setInputValue(updated);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  marginVertical: 5,
                  padding: 8,
                  borderRadius: 6,
                }}
              />
            ))}
            {!showAnswer && (
              <TouchableOpacity
                onPress={() => {
                  const correct = inputValue.every(
                    (ans, idx) =>
                      ans.trim().toLowerCase() ===
                      q.correct_answers[idx].trim().toLowerCase()
                  );
                  handleAnswer(correct);
                }}
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            )}
          </>
        );

      case "FreeText":
      case "VoiceAnswer":
        return (
          <>
            <TextInput
              placeholder="Type your answer"
              value={inputValue}
              onChangeText={setInputValue}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 6,
              }}
            />
            {!showAnswer && (
              <TouchableOpacity
                onPress={() => handleAnswer(true)}
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            )}
          </>
        );

      case "Highlight":
        return <Text>{q.text}</Text>;

      case "ReorderList":
        return q.steps.map((s, i) => <Text key={i}>• {s}</Text>);

      case "FeynmanWhy":
        return q.questions.map((why, i) => <Text key={i}>• {why}</Text>);

      case "MiniMindmap":
        return (
          <>
            <Text style={{ fontWeight: "bold" }}>{q.central_concept}</Text>
            {q.nodes.map((node, i) => (
              <View key={i}>
                <Text>• {node.label}</Text>
                {node.children.map((c, j) => (
                  <Text key={j} style={{ marginLeft: 10 }}>
                    ↳ {c.label}
                  </Text>
                ))}
              </View>
            ))}
          </>
        );

      case "MatchPair":
        return q.pairs.map((pair, i) => (
          <Text key={i}>
            • {pair.left} → {pair.right}
          </Text>
        ));

      case "AnalogyCard":
        return (
          <>
            <Text style={{ fontWeight: "bold" }}>{q.title}</Text>
            {q.infos.map((info, i) => (
              <Text key={i}>• {info}</Text>
            ))}
          </>
        );

      case "Derivation":
        return q.steps.map((s, i) => (
          <View key={i} style={{ marginVertical: 6 }}>
            <Text style={{ fontWeight: "bold" }}>{s.title}</Text>
            <Text>{s.description}</Text>
          </View>
        ));

      case "SwipeCards":
        return (
          <>
            <Text>{q.statement}</Text>
            {!showAnswer && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity onPress={() => handleAnswer(true)}>
                  <Text>👍 True</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleAnswer(false)}>
                  <Text>👎 False</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        );

      case "ListenAndType":
        return (
          <>
            <Text style={{ fontStyle: "italic", marginBottom: 10 }}>
              (Audio simulation not implemented) Please type what you hear:
            </Text>
            <TextInput
              placeholder="Type what you hear"
              value={inputValue}
              onChangeText={setInputValue}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 6,
              }}
            />
            {!showAnswer && (
              <TouchableOpacity
                onPress={() => {
                  const correct =
                    inputValue.trim().toLowerCase() ===
                    q.text.trim().toLowerCase();
                  handleAnswer(correct);
                }}
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            )}
          </>
        );

      case "Translation":
        return (
          <>
            <Text style={{ marginBottom: 5 }}>
              Translate from {q.from_language} to {q.to_language}:
            </Text>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              {q.text}
            </Text>
            <TextInput
              placeholder={`Type your translation in ${q.to_language}`}
              value={inputValue}
              onChangeText={setInputValue}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                borderRadius: 6,
              }}
            />
            {!showAnswer && (
              <TouchableOpacity
                onPress={() => handleAnswer(true)}
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            )}
          </>
        );

      case "SpacedRecap":
        return (
          <View>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Spaced Recap Section
            </Text>
            {q.questions && q.questions.length > 0 ? (
              q.questions.map((subQ, i) => (
                <Text key={i} style={{ marginBottom: 5 }}>
                  • {typeof subQ === "string" ? subQ : JSON.stringify(subQ)}
                </Text>
              ))
            ) : (
              <Text>No recap questions provided.</Text>
            )}
          </View>
        );

      case "SpeakAndRepeat":
        return (
          <>
            <Text style={{ fontStyle: "italic", marginBottom: 10 }}>
              Speak and repeat the following phrase:
            </Text>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{q.text}</Text>
            {!showAnswer && (
              <TouchableOpacity
                onPress={() => handleAnswer(true)}
                style={{
                  backgroundColor: "#007bff",
                  padding: 10,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Mark as Done
                </Text>
              </TouchableOpacity>
            )}
          </>
        );

      case "SliderEstimate":
        return (
          <>
            <Text>{q.question}</Text>
            <Text>
              Correct Value: {q.correct_value}
              {q.unit}
            </Text>
            {!showAnswer && (
              <TouchableOpacity
                onPress={() => handleAnswer(true)}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: "blue" }}>Mark as Done</Text>
              </TouchableOpacity>
            )}
          </>
        );

      default:
        return <Text>Unsupported question type: {q.type}</Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
        Q{currentIndex + 1}:{" "}
        {q.question || q.statement || q.title || q.description}
      </Text>

      {renderByType()}

      {showAnswer && q.explanation && (
        <Text style={{ color: "#555", marginTop: 10 }}>
          Explanation: {q.explanation}
        </Text>
      )}

      {(showAnswer ||
        [
          "FeynmanWhy",
          "MiniMindmap",
          "Derivation",
          "AnalogyCard",
          "Highlight",
          "MatchPair",
          "ReorderList",
          "SpacedRecap",
        ].includes(q.type)) && (
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: "#28a745",
            padding: 10,
            borderRadius: 6,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Next</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

export default LessonStart;
