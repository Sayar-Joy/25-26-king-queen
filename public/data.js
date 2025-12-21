/* Candidate data for both categories. */
const demoMalePhoto = "assets/male.jpeg";
const demoFemalePhoto = "assets/female.jpeg";

const maleCandidates = [
  {
    name: "Aiden Kyaw",
    rollNumber: "CEIT-201",
    photo: demoMalePhoto,
    hobby: "Building racing drones",
    about:
      "Focuses on practical aeronautics projects and mentors freshmen in robotics club meetings.",
  },
  {
    name: "Min Htet Soe",
    rollNumber: "CEIT-202",
    photo: demoMalePhoto,
    hobby: "Classical guitar",
    about:
      "Organizes unplugged sessions on campus to raise funds for local literacy programs.",
  },
  {
    name: "Kaung Khant",
    rollNumber: "CEIT-203",
    photo: demoMalePhoto,
    hobby: "Trail running",
    about:
      "Leads the university adventure society and champions sustainable campus cleanups.",
  },
  {
    name: "Thura Lin",
    rollNumber: "CEIT-204",
    photo: demoMalePhoto,
    hobby: "Competitive coding",
    about:
      "National hackathon finalist who tutors peers in algorithms every weekend.",
  },
  {
    name: "Sir Thihah",
    rollNumber: "CEIT-205",
    photo: demoMalePhoto,
    hobby: "Photography",
    about:
      "Documents student life and curates exhibitions that highlight campus diversity.",
  },
  {
    name: "Hein Paing",
    rollNumber: "CEIT-206",
    photo: demoMalePhoto,
    hobby: "Basketball",
    about:
      "Captains the varsity squad and hosts community sports clinics for local teens.",
  },
  {
    name: "Nay Min Aung",
    rollNumber: "CEIT-207",
    photo: demoMalePhoto,
    hobby: "Culinary experiments",
    about:
      "Runs weekend pop-up cafés that donate proceeds to the student emergency fund.",
  },
];

const femaleCandidates = [
  {
    name: "Thiri Su",
    rollNumber: "CEIT-301",
    photo: demoFemalePhoto,
    hobby: "Contemporary dance",
    about:
      "Choreographs inclusive performances that blend traditional and modern styles.",
  },
  {
    name: "Phyu Yadanar",
    rollNumber: "CEIT-302",
    photo: demoFemalePhoto,
    hobby: "Digital illustration",
    about:
      "Designs open-source study guides and leads workshops on visual storytelling.",
  },
  {
    name: "Ei Mon Kyaing",
    rollNumber: "CEIT-303",
    photo: demoFemalePhoto,
    hobby: "Community gardening",
    about:
      "Cultivates rooftop gardens that supply the dorm kitchen with fresh produce.",
  },
  {
    name: "Hnin Yu",
    rollNumber: "CEIT-304",
    photo: demoFemalePhoto,
    hobby: "Debate",
    about:
      "Chairs the debate council and advocates for student-led policy reforms.",
  },
  {
    name: "Yuri Sandar",
    rollNumber: "CEIT-305",
    photo: demoFemalePhoto,
    hobby: "Astrophotography",
    about:
      "Hosts stargazing nights that inspire underclassmen to explore space science.",
  },
  {
    name: "Nandar Hlaing",
    rollNumber: "CEIT-306",
    photo: demoFemalePhoto,
    hobby: "Volunteering at shelters",
    about:
      "Coordinates outreach drives to provide tech education for displaced youth.",
  },
  {
    name: "Su Nyein Ei",
    rollNumber: "CEIT-307",
    photo: demoFemalePhoto,
    hobby: "Indie film production",
    about:
      "Produces documentary shorts featuring student innovators across faculties.",
  },
];

window.candidateData = { maleCandidates, femaleCandidates };
