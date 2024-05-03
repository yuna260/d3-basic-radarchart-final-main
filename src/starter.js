import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 65, right: 50, bottom: 65, left: 50 };

// console.log(width + "," + height);

// group
const g = svg
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

// scale
let minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, minLen]);
const attributes = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physic",
];
const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

const radius = [0, 25, 50, 75, 100];

// line radial
const radarLine = d3
  .lineRadial()
  .curve(d3.curveCardinalClosed)
  .angle((d, i) => angleScale(i))
  .radius((d) => radiusScale(selectedplayer[d]));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data

let data = [];
let selectedplayer;
let radiusAxis, angleAxis, labels, path;
let players;
let selectedName = "H. Son";

d3.json("data/fifa23_maleplayers.json").then((raw_data) => {
  data = raw_data.filter((d) => d.overall > 85);
  selectedplayer = data.filter((d) => d.short_name === selectedName)[0];

  players = [...new Set(data.map((d) => d.short_name))];

  // console.log(players);

  const dropdown = document.getElementById("options");
  players.map((d) => {
    const option = document.createElement("option");
    option.value = d;
    option.innerHTML = d;
    option.selected = d === selectedName ? true : false;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", function () {
    selectedName = dropdown.value;
    console.log(selectedName);
    updatePlayer();
    // update player
  });

  // axis
  radiusAxis = g
    .selectAll("radius-axis")
    .data(radius)
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", (d) => radiusScale(d))
    .attr("fill", "rgba(10,10,10,0.01)")
    .attr("stroke", "#c3c3c3")
    .attr("stroke-width", 0.5);

  angleAxis = g
    .selectAll("angle-axis")
    .data(attributes)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => getXPos(100, i))
    .attr("y2", (d, i) => getYPos(100, i))
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0.5);

  labels = g
    .selectAll("labels")
    .data(attributes)
    .enter()
    .append("text")
    .attr("x", (d, i) => getXPos(120, i))
    .attr("y", (d, i) => getYPos(120, i))
    .text((d) => d)
    .attr("class", "labels");

  path = g
    .append("path")
    .datum(attributes)
    .attr("d", radarLine)
    .attr("fill", "rgba(0,0,255,0.1)")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.3)
    .style("fill-opacity", 0.6);

  d3.select("#player-name").text(selectedplayer.long_name);
});

// function

const getXPos = (dist, index) => {
  // radius*cos(theta)
  return radiusScale(dist) * Math.cos(angleScale(index) - Math.PI / 2);
};

const getYPos = (dist, index) => {
  // radius*sin(theta)
  return radiusScale(dist) * Math.sin(angleScale(index) - Math.PI / 2);
};

// update
const updatePlayer = () => {
  selectedplayer = data.filter((d) => d.short_name == selectedName)[0];

  radarLine.radius((d) => radiusScale(selectedplayer[d]));

  path.transition().duration(600).attr("d", radarLine);

  d3.select("#player-name").text(selectedplayer.long_name);
};

// resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));
  g.attr("transform", `translate(${width / 2},${height / 2})`);
  minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);

  // scale
  radiusScale.range([0, minLen]);
  // axis

  radiusAxis.attr("r", (d) => radiusScale(d));

  angleAxis
    .attr("x2", (d, i) => getXPos(100, i))
    .attr("y2", (d, i) => getYPos(100, i));

  // path
  radarLine.radius((d) => radiusScale(selectedplayer[d]));
  path.attr("d", radarLine);

  // label
  labels
    .attr("x", (d, i) => getXPos(120, i))
    .attr("y", (d, i) => getYPos(120, i));
});
