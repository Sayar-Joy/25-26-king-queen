/* Candidate data for both categories. */
const demoMalePhoto = "assets/male.jpeg";
const demoFemalePhoto = "assets/female.jpeg";

const maleCandidates = [
  {
    id: "k1",
    name: "Paing Phyo Khant",
    rollNumber: "SI IT-23",
    photo: "assets/kings/ks1/main.jpg",
    detailPhotos: [
      "assets/kings/ks1/detail1.jpg",
      "assets/kings/ks1/detail2.jpg",
      "assets/kings/ks1/detail3.jpg",
    ],
    hobby: "Art & Golf",
    about:
      "Focuses on practical aeronautics projects and mentors freshmen in robotics club meetings.",
  },
  {
    id: "k2",
    name: "Hein Thit Zaw",
    rollNumber: "SI IT 30",
    photo: "assets/kings/ks2/main.jpg",
    detailPhotos: [
      "assets/kings/ks2/detail1.jpg",
      "assets/kings/ks2/detail2.jpg",
      "assets/kings/ks2/detail3.jpg",
    ],
    hobby: "Classical guitar",
    about:
      "Organizes unplugged sessions on campus to raise funds for local literacy programs.",
  },
  {
    id: "k3",
    name: "Min Thu Kha",
    rollNumber: "SI IT --",
    photo: "assets/kings/ks3/main.jpg",
    detailPhotos: [
      "assets/kings/ks3/detail1.jpg",
      "assets/kings/ks3/detail2.jpg",
      "assets/kings/ks3/detail3.jpg",
    ],
    hobby: "Reading and badminton 🏸",
    about:
      "I am a passionate reader and an occasional writer with a keen interest in business and management. Beyond my academic and professional pursuits, I enjoy staying active through badminton and find great value in participating in panel discussions and collaborative dialogues.Mirrors reflect our outer beauty; books reflect our inner growth.",
  },
  {
    id: "k4",
    name: "Kaung Khant Zaw",
    rollNumber: "SI IT-19",
    photo: "assets/kings/ks4/main.jpg",
    detailPhotos: [
      "assets/kings/ks4/detail1.jpg",
      "assets/kings/ks4/detail2.jpg",
      "assets/kings/ks4/detail3.jpg",
    ],
    hobby: "art, sports and playing guitar",
    about:
      "I’m Kaung Khant Zaw — your artist, athlete, and guitar-shredder. I don't just follow the beat; I create it. I’m bringing my A-game from the court to the stage to represent you as King. Simple as that. Your vote, my vibe!",
  },
  {
    id: "k5",
    name: "Tin Min Khant",
    rollNumber: "SI IT-43",
    photo: "assets/kings/ks5/main.jpg",
    detailPhotos: [
      "assets/kings/ks5/detail1.jpg",
      "assets/kings/ks5/detail2.jpg",
      "assets/kings/ks5/detail3.jpg",
    ],
    hobby: "Calculation and exploration",
    about:
      "While others take things for granted, I earn them through dedication. As a phoenix who can overcome any adversity, letting me go is a mistake your future cannot afford.",
  },
  {
    id: "k6",
    name: "Paing Min Kyaw",
    rollNumber: "SI IT-22",
    photo: "assets/kings/ks6/main.jpg",
    detailPhotos: [
      "assets/kings/ks6/detail1.jpg",
      "assets/kings/ks6/detail2.jpg",
      "assets/kings/ks6/detail3.jpg",
    ],
    hobby: "Basketball",
    about:
      "Captains the varsity squad and hosts community sports clinics for local teens.",
  },
];

const femaleCandidates = [
  {
    id: "q1",
    name: "Myo Nwe Ei",
    rollNumber: "SI IT 2",
    photo: "assets/queens/qs1/main.jpg",
    detailPhotos: [
      "assets/queens/qs1/detail1.jpg",
      "assets/queens/qs1/detail2.jpg",
      "assets/queens/qs1/detail3.jpg",
    ],
    hobby: "Learning languages",
    about:
      "“I don’t talk much, but when I care, I’m always there for you.”",
  },
  {
    id: "q2",
    name: "Thet Htar Zin",
    rollNumber: "SI IT---",
    photo: "assets/queens/qs2/main.jpg",
    detailPhotos: [
      "assets/queens/qs2/detail1.jpg",
      "assets/queens/qs2/detail2.jpg",
      "assets/queens/qs2/detail3.jpg",
    ],
    hobby: "almost everything (like “when will my life begin” song )",
    about:
      "Introvert by default, extrovert once you say hi.",
  },
  {
    id: "q3",
    name: "Zinlei Winhtut",
    rollNumber: "SI IT 8",
    photo: "assets/queens/qs3/main.jpg",
    detailPhotos: [
      "assets/queens/qs3/detail1.jpg",
      "assets/queens/qs3/detail2.jpg",
      "assets/queens/qs3/detail3.jpg",
    ],
    hobby: "Watching movies",
    about:
      "turning free times into movie times ( stranger things enthusiast)",
  },
  {
    id: "q4",
    name: "Myat Hay Thi Khin",
    rollNumber: "SI IT-36",
    photo: "assets/queens/qs4/main.jpg",
    detailPhotos: [
      "assets/queens/qs4/detail1.jpg",
      "assets/queens/qs4/detail2.jpg",
      "assets/queens/qs4/detail3.jpg",
    ],
    hobby: "Drawing",
    about:
      "I'm a quiet person but once you get to know me I'll always be supporting you.",
  },
  {
    id: "q5",
    name: "Thet Shwe Htike",
    rollNumber: "SI IT---",
    photo: "assets/queens/qs5/main.jpg",
    detailPhotos: [
      "assets/queens/qs5/detail1.jpg",
      "assets/queens/qs5/detail2.jpg",
      "assets/queens/qs5/detail3.jpg",
    ],
    hobby: "Reading & swimming",
    about:
      "I choose growth over comparison, authenticity over perfection. I embrace my flaws and move forward with calm confidence and quiet purpose.",
  },
  {
    id: "q6",
    name: "Nyein Su Thaw",
    rollNumber: "SI IT 70",
    photo: "assets/queens/qs6/main.jpg",
    detailPhotos: [
      "assets/queens/qs6/detail1.jpg",
      "assets/queens/qs6/detail2.jpg",
      "assets/queens/qs6/detail3.jpg",
    ],
    hobby: "Volunteering at shelters",
    about:
      "Coordinates outreach drives to provide tech education for displaced youth.",
  },
];

window.candidateData = { maleCandidates, femaleCandidates };
