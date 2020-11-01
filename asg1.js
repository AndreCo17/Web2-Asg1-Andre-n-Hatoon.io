    /* inititializes map from Google's API */
    function initMap() {

        map = new google.maps.Map(document.querySelector("div#map"), {
            center: { lat: 41.89474, lng: 12.4839 },
            zoom: 6
        });
    }

    /* fetches data from galleries.php to be used to populate the galleryList section */
    document.addEventListener("DOMContentLoaded", function () {
    const galleryAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/art/galleries.php";

    fetch(galleryAPI)
        .then(resp => resp.json())
        .then(data => {
            document.querySelector("#loader").style.display = "block";
            populateGalleries(data);
        })
        .catch(err => console.error(err));


    /* populates galleryList section, populate galleryInfo section,
    generate the list of paintings in selected gallery and displays map with the gallery's location */
    function populateGalleries(data) {
        document.querySelector("#loader").style.display = "none";
        const list = document.querySelector("#galleries");
        data.forEach(d => {
            let li = document.createElement("li");
            li.textContent = d.GalleryName;

            li.addEventListener("click", function () {
                galleryInfo(d);
                createMap(d);
                generatePaintings(d);
            });

            list.appendChild(li);
        });
        
    /* controls the toggle functionality of the galleryList section and makes more space for the other information */
        let button = document.querySelector("#toggleListButton");
        let gList = document.querySelector("#galleryList");
        let gInfo = document.querySelector("#galleryInfo");
        let paintings = document.querySelector("#paintingsList");
        let map = document.querySelector('#map')

        //have to double click on the button to work 
        button.addEventListener('click', () => {
            if (gList.style.display == "block") {
                gList.style.display = "none";
                gInfo.style.gridColumn = "1/2";
                paintings.style.gridColumn = "2/4";
                map.style.gridColumn = "1/5";

            } else {
                gList.style.display = "block";
                gList.style.gridColumn = "1/2";
                gInfo.style.gridColumn = "2/3";
                paintings.style.gridColumn = "3/5";
                map.style.gridColumn = "2/5";
            }
        });
    }

    /* fills in the information for each selected gallery including:
    name, native name, city, address, country and its museum website */
    function galleryInfo(gallery) {

        document.querySelector(".info").style.display = "inline";
        document.querySelector("#galleryName").innerHTML = gallery.GalleryName + "<br>";;
        document.querySelector("#galleryNative").innerHTML = gallery.GalleryNativeName + "<br>";;
        document.querySelector("#galleryCity").innerHTML = gallery.GalleryCity + "<br>";;
        document.querySelector("#galleryAddress").innerHTML = gallery.GalleryAddress + "<br>";;
        document.querySelector("#galleryCountry").innerHTML = gallery.GalleryCountry + "<br>";;

        const a = document.querySelector("#website");
        a.setAttribute("href", gallery.GalleryWebSite);
        document.querySelector("#galleryInfo .info").appendChild(a);
    }

    /* create a map using Google's API */
    function createMap(gallery) {

        map = new google.maps.Map(document.querySelector("div#map"), {
            center: { lat: gallery.Latitude, lng: gallery.Longitude },
            zoom: 18,
            mapTypeId: 'satellite'
        });
    }

    /* fetches the information from paintings.php */
    function generatePaintings(d) {
        fetch(`https://www.randyconnolly.com/funwebdev/3rd/api/art/paintings.php?gallery=${d.GalleryID}`)
            .then(response => response.json())
            .then(paintingsData => {
                populatePaintingsTable(paintingsData);
                sortingTable(paintingsData);
            }).catch(err => console.error(err));
    }

    /* creates the list of paintings in the gallery which can be sorted by name, title and yearOfWork */
    function populatePaintingsTable(paintingsData) {
        let paintingsTable = document.querySelector("tbody");
        paintingsTable.textContent = "";

        for (let p of paintingsData) {
            //create new row
            let row = document.createElement("tr");

            //appends new row to table
            paintingsTable.appendChild(row);

            //creating td elements
            let imgtd = document.createElement("td");
            let artist = document.createElement("td");
            let title = document.createElement("td");
            let yow = document.createElement("td");

            let img = document.createElement("img");
            img.src = smallImage(p.ImageFileName);
            img.value = p.ImageFileName;

            //checks if either first and last name are null and replaces them with an empty string
            if (p.LastName == null) {
                artist.innerHTML = p.FirstName + "<br>";
            } else if (p.FirstName == null) {
                artist.innerHTML = p.LastName + "<br>";
            } else {
                artist.innerHTML = p.FirstName + " " + p.LastName + "<br>";
            }

            //changes the content of the element
            title.textContent = p.Title;
            yow.innerHTML = p.YearOfWork + "<br>";

            //appends each painting info into the new row
            imgtd.appendChild(img);
            row.appendChild(imgtd);
            row.appendChild(artist);
            row.appendChild(title);
            row.appendChild(yow);

            //handles the "click" by the user and expand image
            img.addEventListener('click', function (e) {

                largeImg(e);
                largeImgInfo(e, paintingsData);

            });
        }
    }

    /* sorts the table of painting based on user's input(click) */
    function sortingTable(paintings) {
        let artist = document.querySelector("#artist");
        let year = document.querySelector("#year");
        let title = document.querySelector("#title");

        artist.addEventListener("click", function () {
            let sortedArtists = paintings.sort((a, b) => {
                return a.LastName < b.LastName ? -1 : 1;
            })
            populatePaintingsTable(sortedArtists);
        });
        year.addEventListener("click", function () {
            let sortedYears = paintings.sort((a, b) => {
                return a.YearOfWork < b.YearOfWork ? -1 : 1;
            })
            populatePaintingsTable(sortedYears);
        });
        title.addEventListener("click", function () {
            let sortedTitles = paintings.sort((a, b) => {
                return a.Title < b.Title ? -1 : 1;
            })
            populatePaintingsTable(sortedTitles);
        });
    }


    /* retrieves data from the cloud and returns the image passed in with a size of 55px x 55px */
    function smallImage(filename) {
        let size = "w_55";
        return `https://res.cloudinary.com/funwebdev/image/upload/${size}/art/paintings/${filename}`;
    }

    /* retrieves data from the cloud with the size of 400px x 400px.*/
    /*When the small image is clicked, the "main" will be hidden which includes:
    galleryList, galleryInfo, paintingslist, and the map and replaced
    with just the details view of the single painting chosen.*/
    /*When the single view painting is clicked once more, the image is magnified
    and enters a "lightbox effect".*/
    function largeImg(e) {
        let size = "w_400";

        document.querySelector("#main").style.display = "none";
        document.querySelector("#hidden").style.display = "grid";

        let img = document.querySelector("#bigImg");
        img.src = `https://res.cloudinary.com/funwebdev/image/upload/${size}/art/paintings/${e.target.value}`;

        let biggerImg = document.querySelector("#biggerImg");
        img.addEventListener("click", function () {
            let biggerSize = "w_700";
            document.querySelector("#hiddenDiv").style.display = "none";
            document.querySelector("#bigImg").style.display = "none";
            document.querySelector("#closeButton").style.display = "none";
            document.querySelector("#hidden").style.display = "none";
            biggerImg.style.margin = "auto";
            biggerImg.style.display = "block";
            biggerImg.src = `https://res.cloudinary.com/funwebdev/image/upload/${biggerSize}/art/paintings/${e.target.value}`
        });

        biggerImg.addEventListener("click", function() {
            biggerImg.style.display = "none";
            document.querySelector("#hidden").style.display = "grid";
            document.querySelector("#hiddenDiv").style.display = "inline";
            document.querySelector("#bigImg").style.display = "inline";
            document.querySelector("#closeButton").style.display = "inline";

        });

    }

    /*retrieves and organizes all the details about the painting that was chosen by user's click  */
    function largeImgInfo(e, paintingsData) {

        let painting = paintingsData.find(p => p.ImageFileName == e.target.value);
        let artist = document.querySelector("#artistName");
        let desc = document.querySelector("#description");

        document.querySelector("#paintingTitle").innerHTML = painting.Title + "<br>";
        document.querySelector("#yow").innerHTML = painting.YearOfWork + "<br>";
        document.querySelector("#medium").innerHTML = painting.Medium + "<br>";
        document.querySelector("#width").innerHTML = painting.Width + "<br>";
        document.querySelector("#height").innerHTML = painting.Height + "<br>";
        document.querySelector("#copyright").innerHTML = painting.CopyrightText + "<br>";
        document.querySelector("#gName").innerHTML = painting.GalleryName + "<br>";
        document.querySelector("#gCity").innerHTML = painting.GalleryCity + "<br>";
        document.querySelector("#mLink").href = painting.MuseumLink;
        document.querySelector("#mLink").innerHTML = "Visit Website" + "<br> "

        /* checks if lastName or firstName is null and replace it with an empty string to prevent "null" from being displayed */
        if (painting.LastName == null) {
            artist.innerHTML = painting.FirstName + "<br>";
        } else if (painting.FirstName == null) {
            artist.innerHTML = painting.LastName + "<br>";
        } else {
            artist.innerHTML = painting.FirstName + " " + painting.LastName + "<br>";
        }

        if (painting.Description == null) {
            desc.innerHTML = "N/A" + "<br>";
        } else {
            desc.innerHTML = painting.Description + "<br>";
        }

        colourBlocks(painting);
        buttonClicked();
    }

    /*called when the close button within the single painting view is clicked */
    function buttonClicked() {
        document.querySelector("#closeButton").addEventListener("click", function () {
            document.querySelector("#main").style.display = "grid";
            document.querySelector("#hidden").style.display = "none";
        })
    }

    /*creates the colour blocks based on the colours that is most prominent within the single painting.  */
    function colourBlocks(painting) {
        let div = document.querySelector("#coloursBlock")
        div.textContent = "";
        for (let p of painting.JsonAnnotations.dominantColors) {
            let span = document.createElement("span");
            let colour = p.web;
            span.style.backgroundColor = colour;
            span.style.padding = "15px 25px";
            span.style.margin = "5px";
            span.title = `${colour}, ${p.name}`;
            div.appendChild(span);

        }
    }



});