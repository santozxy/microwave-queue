export interface Employee {
  name: string;
  photo: string;
}

export const employeeProfiles: Employee[] = [
  {
    name: "Catatau",
    photo: "/assets/integrantes/catatau.jpeg",
  },
  {
    name: "Mão de obra quase barata",
    photo: "/assets/integrantes/mao-de-obra-quase-barata.jpeg",
  },
  {
    name: "É o Jeff",
    photo: "/assets/integrantes/e-o-jeff.jpeg",
  },
  {
    name: "Fabão",
    photo: "/assets/integrantes/fabao.jpeg",
  },
  {
    name: "Negão 🏳️‍🌈",
    photo: "/assets/integrantes/negao.png",
  },
  {
    name: "Pacote Office 365 🏳️‍🌈",
    photo: "/assets/integrantes/pacote-office-365.jpeg",
  },
  {
    name: "QA Cachaça 🥃",
    photo: "/assets/integrantes/qa-cachaca.jpeg",
  },
  {
    name: "Webson Siacalme",
    photo: "/assets/integrantes/webson-siacalme.jpeg",
  },
  {
    name: "Momom",
    photo: "/assets/integrantes/momom.jpeg",
  },
  {
    name: "Juno Severino",
    photo: "/assets/integrantes/juno-severino.jpeg",
  },
  {
    name: "Cláudia",
    photo: "/assets/integrantes/claudia.jpeg",
  },
  {
    name: "Glória 🙏",
    photo: "/assets/integrantes/gloria.jpeg",
  },
  {
    name: "Matheus Escobar 🚬",
    photo: "/assets/integrantes/matheus-escobar.jpeg",
  },
  {
    name: "Sereio 🧜🏻‍♂️",
    photo: "/assets/integrantes/sereio.jpeg",
  },
];

export const employees = employeeProfiles.map((employee) => employee.name);

export function getEmployeeProfile(name: string) {
  return employeeProfiles.find((employee) => employee.name === name);
}

export function getEmployeeInitials(name: string) {
  const [first = "", second = ""] = name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/);

  return `${first.at(0) ?? ""}${second.at(0) ?? ""}`.toUpperCase();
}
