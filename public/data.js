/* Candidate data for both categories. */
const demoMalePhoto = "assets/male.jpeg";
const demoFemalePhoto = "assets/female.jpeg";

const maleCandidates = [
  {
    id: "k1",
    name: "Aiden Kyaw",
    rollNumber: "CEIT-201",
    photo: "assets/kings/ks1/main.jpg",
    detailPhotos: [],
    hobby: "Building racing drones",
    about:
      "Focuses on practical aeronautics projects and mentors freshmen in robotics club meetings.",
  },
  {
    id: "k2",
    name: "Min Htet Soe",
    rollNumber: "CEIT-202",
    photo: "assets/kings/ks2/main.jpg",
    detailPhotos: [],
    hobby: "Classical guitar",
    about:
      "Organizes unplugged sessions on campus to raise funds for local literacy programs.",
  },
  {
    id: "k3",
    name: "Kaung Khant",
    rollNumber: "CEIT-203",
    photo: "assets/kings/ks3/main.jpg",
    detailPhotos: [],
    hobby: "Trail running",
    about:
      "Leads the university adventure society and champions sustainable campus cleanups.",
  },
  {
    id: "k4",
    name: "Thura Lin",
    rollNumber: "CEIT-204",
    photo: "assets/kings/ks4/main.jpg",
    detailPhotos: [
      "assets/kings/ks4/detail1.jpg",
      "assets/kings/ks4/detail2.jpg",
      "assets/kings/ks4/detail3.jpg",
    ],
    hobby: "Competitive coding",
    about:
      "National hackathon finalist who tutors peers in algorithms every weekend.",
  },
  {
    id: "k5",
    name: "Sir Thihah",
    rollNumber: "CEIT-205",
    photo: "assets/kings/ks5/main.jpg",
    detailPhotos: [],
    hobby: "Photography",
    about:
      "Documents student life and curates exhibitions that highlight campus diversity.",
  },
  {
    id: "k6",
    name: "Hein Paing",
    rollNumber: "CEIT-206",
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
    name: "Thiri Su",
    rollNumber: "CEIT-301",
    photo: "assets/queens/qs1/main.jpg",
    detailPhotos: [],
    hobby: "Contemporary dance",
    about:
      "Choreographs inclusive performances that blend traditional and modern styles.",
  },
  {
    id: "q2",
    name: "Phyu Yadanar",
    rollNumber: "CEIT-302",
    photo: "assets/queens/qs2/main.jpg",
    detailPhotos: [],
    hobby: "Digital illustration",
    about:
      "Designs open-source study guides and leads workshops on visual storytelling.",
  },
  {
    id: "q3",
    name: "Ei Mon Kyaing",
    rollNumber: "CEIT-303",
    photo: "assets/queens/qs3/main.jpg",
    detailPhotos: [],
    hobby: "Community gardening",
    about:
      "Cultivates rooftop gardens that supply the dorm kitchen with fresh produce.",
  },
  {
    id: "q4",
    name: "Hnin Yu",
    rollNumber: "CEIT-304",
    photo: "assets/queens/qs4/main.jpg",
    detailPhotos: [],
    hobby: "Debate",
    about:
      "Chairs the debate council and advocates for student-led policy reforms.",
  },
  {
    id: "q5",
    name: "Yuri Sandar",
    rollNumber: "CEIT-305",
    photo: "assets/queens/qs5/main.jpg",
    detailPhotos: [],
    hobby: "Astrophotography",
    about:
      "Hosts stargazing nights that inspire underclassmen to explore space science.",
  },
  {
    id: "q6",
    name: "Nandar Hlaing",
    rollNumber: "CEIT-306",
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
