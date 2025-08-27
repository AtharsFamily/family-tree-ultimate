let treeData = { name: "Root", children: [] };

function updateTree() {
  const svg = d3.select("#tree");
  svg.selectAll("*").remove();

  const width = 1000, height = 600;
  const root = d3.hierarchy(treeData);

  const treeLayout = d3.tree().size([width, height - 200]);
  treeLayout(root);

  svg.attr("viewBox", [0, 0, width, height]);

  // Links
  svg.selectAll("line")
    .data(root.links())
    .enter()
    .append("line")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#555");

  // Nodes
  const nodes = svg.selectAll("g")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  nodes.append("circle")
    .attr("r", 20)
    .attr("fill", "#2a9d8f")
    .on("click", d => editPerson(d));

  nodes.append("text")
    .text(d => d.data.name)
    .attr("text-anchor", "middle")
    .attr("dy", 5)
    .attr("fill", "white");
}

function addPerson() {
  const name = prompt("Enter name:");
  if (!name) return;
  treeData.children.push({ name, children: [] });
  updateTree();
}

function editPerson(d) {
  const newName = prompt("Edit name:", d.data.name);
  if (newName) {
    d.data.name = newName;
    updateTree();
  }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(treeData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "family-tree.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    treeData = JSON.parse(e.target.result);
    updateTree();
  };
  reader.readAsText(file);
}

function downloadPNG() {
  const svg = document.getElementById("tree");
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const img = new Image();
  img.src = "data:image/svg+xml;base64," + btoa(source);
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.download = "family-tree.png";
    link.href = canvas.toDataURL();
    link.click();
  };
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l", "pt", "a4");
  doc.text("Family Tree", 40, 40);
  doc.save("family-tree.pdf");
}

function loadDemo() {
  fetch("demo.json")
    .then(r => r.json())
    .then(data => {
      treeData = data;
      updateTree();
    });
}

updateTree();
