// Celestial body data with accurate properties
const CELESTIAL_DATA = {
    sun: {
        name: "Sun",
        radius: 696340, // km
        displayRadius: 5, // scaled for visualization
        rotationPeriod: 25.4, // days
        color: 0xFDB813,
        description: "The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
        stats: {
            "Mass": "1.989 × 10³⁰ kg",
            "Temperature": "5,778 K (surface)",
            "Age": "4.6 billion years",
            "Composition": "73% Hydrogen, 25% Helium"
        }
    },
    planets: {
        mercury: {
            name: "Mercury",
            radius: 2439.7, // km
            displayRadius: 0.8,
            distance: 57.9, // million km from sun
            displayDistance: 20,
            orbitalPeriod: 88, // days
            rotationPeriod: 58.6, // days
            color: 0x8C7853,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg", // Removed for faster loading
            description: "Mercury is the smallest planet in the Solar System and the closest to the Sun. It has a very thin atmosphere and experiences extreme temperature variations.",
            stats: {
                "Distance from Sun": "57.9 million km",
                "Orbital Period": "88 Earth days",
                "Day Length": "58.6 Earth days",
                "Mass": "3.301 × 10²³ kg",
                "Moons": "0"
            }
        },
        venus: {
            name: "Venus",
            radius: 6051.8,
            displayRadius: 1.2,
            distance: 108.2,
            displayDistance: 30,
            orbitalPeriod: 225,
            rotationPeriod: -243, // retrograde rotation
            color: 0xFFC649,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/0/08/Venus_from_Mariner_10.jpg", // Removed for faster loading
            description: "Venus is the second planet from the Sun and the hottest planet in the Solar System due to its thick, toxic atmosphere that traps heat.",
            stats: {
                "Distance from Sun": "108.2 million km",
                "Orbital Period": "225 Earth days",
                "Day Length": "243 Earth days (retrograde)",
                "Mass": "4.867 × 10²⁴ kg",
                "Surface Temperature": "462°C"
            }
        },
        earth: {
            name: "Earth",
            radius: 6371,
            displayRadius: 1.3,
            distance: 149.6,
            displayDistance: 42,
            orbitalPeriod: 365.25,
            rotationPeriod: 1,
            color: 0x6B93D6,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg", // Removed for faster loading
            description: "Earth is the third planet from the Sun and the only known planet to harbor life. It has a dynamic atmosphere, liquid water, and a protective magnetic field.",
            stats: {
                "Distance from Sun": "149.6 million km",
                "Orbital Period": "365.25 days",
                "Day Length": "24 hours",
                "Mass": "5.972 × 10²⁴ kg",
                "Moons": "1 (Luna)"
            },
            moons: {
                luna: {
                    name: "Luna (Moon)",
                    radius: 1737.4,
                    displayRadius: 0.27,
                    distance: 384.4, // thousand km from earth
                    displayDistance: 3,
                    orbitalPeriod: 27.3,
                    color: 0xC0C0C0,
                    description: "The Moon is Earth's only natural satellite and the fifth largest moon in the Solar System.",
                    stats: {
                        "Distance from Earth": "384,400 km",
                        "Orbital Period": "27.3 days",
                        "Mass": "7.342 × 10²² kg",
                        "Diameter": "3,474 km"
                    }
                }
            }
        },
        mars: {
            name: "Mars",
            radius: 3389.5,
            displayRadius: 0.9,
            distance: 227.9,
            displayDistance: 55,
            orbitalPeriod: 687,
            rotationPeriod: 1.03,
            color: 0xCD5C5C,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg", // Removed for faster loading
            description: "Mars is the fourth planet from the Sun, known as the Red Planet due to iron oxide on its surface. It has the largest volcano and canyon in the Solar System.",
            stats: {
                "Distance from Sun": "227.9 million km",
                "Orbital Period": "687 Earth days",
                "Day Length": "24.6 hours",
                "Mass": "6.39 × 10²³ kg",
                "Moons": "2 (Phobos, Deimos)"
            }
        },
        jupiter: {
            name: "Jupiter",
            radius: 69911,
            displayRadius: 3.5,
            distance: 778.5,
            displayDistance: 80,
            orbitalPeriod: 4333,
            rotationPeriod: 0.41,
            color: 0xD8CA9D,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg", // Removed for faster loading
            description: "Jupiter is the largest planet in the Solar System, a gas giant with a Great Red Spot storm and over 80 moons including the four Galilean moons.",
            stats: {
                "Distance from Sun": "778.5 million km",
                "Orbital Period": "11.9 Earth years",
                "Day Length": "9.9 hours",
                "Mass": "1.898 × 10²⁷ kg",
                "Moons": "80+"
            }
        },
        saturn: {
            name: "Saturn",
            radius: 58232,
            displayRadius: 3.0,
            distance: 1432,
            displayDistance: 110,
            orbitalPeriod: 10759,
            rotationPeriod: 0.45,
            color: 0xFAD5A5,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg", // Removed for faster loading
            description: "Saturn is the sixth planet from the Sun, famous for its prominent ring system. It's a gas giant with a lower density than water.",
            stats: {
                "Distance from Sun": "1.43 billion km",
                "Orbital Period": "29.5 Earth years",
                "Day Length": "10.7 hours",
                "Mass": "5.683 × 10²⁶ kg",
                "Rings": "Prominent ring system"
            }
        },
        uranus: {
            name: "Uranus",
            radius: 25362,
            displayRadius: 2.2,
            distance: 2867,
            displayDistance: 140,
            orbitalPeriod: 30687,
            rotationPeriod: -0.72, // retrograde rotation
            color: 0x4FD0E7,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg", // Removed for faster loading
            description: "Uranus is the seventh planet from the Sun, an ice giant that rotates on its side. It has a faint ring system and 27 known moons.",
            stats: {
                "Distance from Sun": "2.87 billion km",
                "Orbital Period": "84 Earth years",
                "Day Length": "17.2 hours (retrograde)",
                "Mass": "8.681 × 10²⁵ kg",
                "Axial Tilt": "98 degrees"
            }
        },
        neptune: {
            name: "Neptune",
            radius: 24622,
            displayRadius: 2.1,
            distance: 4515,
            displayDistance: 170,
            orbitalPeriod: 60190,
            rotationPeriod: 0.67,
            color: 0x4B70DD,
            // texture: "https://upload.wikimedia.org/wikipedia/commons/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg", // Removed for faster loading
            description: "Neptune is the eighth and outermost planet in the Solar System, an ice giant with the strongest winds in the Solar System reaching speeds of 2,100 km/h.",
            stats: {
                "Distance from Sun": "4.52 billion km",
                "Orbital Period": "165 Earth years",
                "Day Length": "16.1 hours",
                "Mass": "1.024 × 10²⁶ kg",
                "Wind Speed": "Up to 2,100 km/h"
            }
        }
    }
};

// Asteroid belt configuration
const ASTEROID_BELT = {
    innerRadius: 60, // between Mars and Jupiter
    outerRadius: 75,
    particleCount: 2000,
    color: 0x8B7355
};

// Animation and scaling constants
const SCALE_FACTORS = {
    distance: 0.1, // Scale down distances for visibility
    size: 1, // Keep relative sizes accurate
    speed: 100 // Speed up orbital motion for visibility
};
