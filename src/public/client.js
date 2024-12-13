let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
});

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    const newStore = store.merge(store, newState)
    render(root, newStore)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let name = state.get("user").get("name");
    let rovers = state.get("rovers");
    let apod = state.get("apod");

    return `
        <h1 class="text-center">Mars Dashboard</h1>
        <div class="w-100">
            ${Greeting(name)}
            <section>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </div>
        <div class="w-100">
            <h2>Mars Rovers</h2>
            <div class="row">
                ${RoverButtons(rovers)}
            </div>
            <div class="row mt-3" id="rover_info"></div>
        </div>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// Handle rover button click
const handleRoverBtnClick = (name) => {
    getRoverData(name);
}

// generate rover data details
const generateRoverData = ({latest_photos}) => {
    const box = document.getElementById('rover_info');
    box.innerHTML = `
        ${RoverInfo(latest_photos[0])}
        ${RoverImages(latest_photos)}
    `
}

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h2>Welcome, ${name}!</h2>
        `
    }

    return `
        <h2>Hello!</h2>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }
    else{
        // check if the photo of the day is actually type video!
        if (apod.media_type === "video") {
            return (`
                <p>See today's featured video <a href="${apod.url}">here</a></p>
                <p>${apod.title}</p>
                <p>${apod.explanation}</p>
            `)
        } else {
            return (`
                <img src="${apod.image.url}" height="350px" width="100%" />
                <p>${apod.image.explanation}</p>
            `)
        }
    }
}

// Rovers buttons
const RoverButtons = (rovers) => (
    rovers.map(rover => 
        `<div class="col-sm-4 text-center">
            <button class="btn btn-info w-75 my-2" onclick="handleRoverBtnClick('${rover}')">${rover}</button>
        </div>`
    ).join('')
)

// Rover Infor section
const RoverInfo = ({rover}) => {
    const { name, landing_date, launch_date, status, max_date } = rover;
    return (
        `<div class="col-sm-12">
            <h3 class="text-center">Rover ${name}</h3>
            <div class="w-100 text-center">Launch Date: ${launch_date}</div>
            <div class="w-100 text-center">Landing Date: ${landing_date}</div>
            <div class="w-100 text-center">Status: ${status}</div>
            <div class="w-100 text-center">Date the most recent photos were taken: ${max_date}</div>
        </div>`
    )
}

// Render Rover images
const RoverImages = (photos) => (
    photos.map(photo => (
        `<div class="col-sm-12 my-2">
            <img src="${photo.img_src}" height="350px" width="100%" />
        </div>`
    )).join('')
)

// ------------------------------------------------------  API CALLS

// get rover data details
const getRoverData = (name) => {
    fetch(`http://localhost:3000/rovers/${name.toLowerCase()}`)
        .then(res => res.json())
        .then(rover => {
            generateRoverData(rover);
        });
}

// Example API call
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}
