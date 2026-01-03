// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
let totalItems = 0;

    const mapManager = new MapManager();
/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...
function updateLocation() {
    const callback = function (locationHelper) {
        const latitude = locationHelper.latitude;
        const longitude = locationHelper.longitude;

        document.getElementById("tag-latitude").value = latitude;
        document.getElementById("tag-longitude").value = longitude;
        document.getElementById("discovery-latitude").value = latitude;
        document.getElementById("discovery-longitude").value = longitude;
    
        mapManager.initMap(latitude, longitude);

        const map = document.getElementById("map");
        let tags = [];
        if (map?.dataset?.tags) {
            tags = JSON.parse(map.dataset.tags);
        }
        mapManager.updateMarkers(latitude, longitude, tags);
    };

    let latitude = document.getElementById("discovery-latitude").value;
    let longitude = document.getElementById("discovery-longitude").value;

    if (latitude == 0 || longitude == 0) {
        LocationHelper.findLocation(callback);
    } else {
        mapManager.initMap(latitude, longitude);

        const map = document.getElementById("map");
        let tags = [];
        console.log(map.dataset.tags);
        if (map?.dataset?.tags) {
            tags = JSON.parse(map.dataset.tags);
        }
        mapManager.updateMarkers(latitude, longitude, tags);
    }


    const element = document.getElementById("mapView");
    element.remove();

    document.querySelector("#map span")?.remove();

}

async function updateDiscovery(_, page = 1) {
    // get nearby GeoTags of newly added GeoTag
        const params = new URLSearchParams({
            searchterm: document.getElementById("discovery-search").value,
            latitude: document.getElementById("tag-latitude").value,
            longitude: document.getElementById("tag-longitude").value,
            page: page,
            size: pageSize
        });

    const response = await fetch(`/api/geotags?${params}`);
    const result = await response.json();
    
    currentPage = result.page;
    totalPages = result.totalPages;
    totalItems = result.totalItems;

    const dataArray = result.data;

    // delete all list items
    document.getElementById("discoveryResults").innerHTML = "";
    // update List
    dataArray.forEach(geoTag => {
        let name = geoTag.name;
        let latitude = geoTag.latitude;
        let longitude = geoTag.longitude;
        let hashtag = geoTag.hashtag;

        let tagItem = document.createElement("li");
        tagItem.append(`${name} (${latitude}, ${longitude}) ${hashtag}`);
        document.getElementById("discoveryResults").append(tagItem);
    })

    // update Map
    const latitude = document.getElementById("discovery-latitude").value;
    const longitude = document.getElementById("discovery-longitude").value;
    mapManager.updateMarkers(latitude, longitude, dataArray);

    renderPagination();
}

function renderPagination() {
    const pagination = document.querySelector(".pagination");

    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";

    const info = document.getElementById("page-info");
    info.textContent = `${currentPage} / ${totalPages} (${totalItems})`;

    document.getElementById("prev").disabled = currentPage === 1;
    document.getElementById("next").disabled = currentPage === totalPages;
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();

    // Tagging Event-Listener
    document.getElementById("tag-form").addEventListener("submit", (event) => {
        event.preventDefault();

        const newTag = {
            "name": document.getElementById("tag-name").value,
            "latitude": document.getElementById("tag-latitude").value,
            "longitude": document.getElementById("tag-longitude").value,
            "hashtag": document.getElementById("tag-hashtag").value
        }

        fetch("/api/geotags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTag)
        })
            .then(response => response.json())
            .then(() => {
                currentPage = 1;
                updateDiscovery(null, 1);
            })
            .catch(error => console.error("Fehler:", error));
    })

    // Discovery Event-Listener
   document.getElementById("discoveryFilterForm").addEventListener("submit", (event) => {
        event.preventDefault();
        currentPage = 1;
        updateDiscovery(null, 1);
    });

    document.getElementById("prev").addEventListener("click", () => {
        if (currentPage > 1) {
            updateDiscovery(null, currentPage - 1);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        if(currentPage < totalPages) {
            updateDiscovery(null, currentPage + 1);
        }
    });

});

