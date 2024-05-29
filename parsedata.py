import sys
import json
import re
import csv
from bs4 import BeautifulSoup

out = dict()

# sys.argv[1]: html file containing https://en.wikipedia.org/wiki/List_of_Sydney_Trains_railway_stations
# (must sort table first to break apart rowspans and copy HTML directly into file)

# sys.argv[2]: html file containing https://en.wikipedia.org/wiki/List_of_Sydney_Metro_stations

# sys.argv[3]: csv file containing usage stats: https://opendata.transport.nsw.gov.au/dataset/train-station-entries-and-exits-data
# with headers: YEAR, STATION NAME, ... , ENTRIES, EXITS

# sys.argv[4]: stops.txt from TfNSW

with open(sys.argv[1], "r") as fp:
    soup = BeautifulSoup(fp, "html.parser")
    stations = soup.find_all("table", class_="wikitable")[0].find_all("tbody")[0].find_all("tr")
    for station in stations[1:]:
        name = station.find_all("b")[0].find_all("a")[0].contents[0]
        cells = [cell for cell in station.contents if cell != "\n"]
        lines = [line.find_all("span")[0].contents[0] for line in cells[3].contents]
        dist = float(re.sub("[a-zA-Z]", "", cells[5].contents[0]))

        out[name] = {
            "lines": lines,
            "dist": dist
        }

metroDists = {
    "Macquarie University":	22.070,
    "Macquarie Park" : 20.800,
    "North Ryde" : 19.390,
    "Cherrybrook" : 31.000,
    "Castle Hill" : 33.000,
    "Hills Showground" : 35.000,
    "Norwest" : 38.000,
    "Bella Vista" : 40.000,
    "Kellyville" : 42.000,
    "Rouse Hill" : 44.000,
    "Tallawong" : 47.000
}

with open(sys.argv[2], "r") as fp:
    soup = BeautifulSoup(fp, "html.parser")
    stations = soup.find_all("table", class_="wikitable")[0].find_all("tbody")[0].find_all("tr")
    for station in stations[1:]:
        name = station.find_all("a")[0].contents[0]
        cells = [cell for cell in station.contents if cell != "\n"]
        lines = [line.find_all("span")[0].contents[0] for line in cells[2].contents[0]]

        if name not in out:
            out[name] = { "lines": [], "dist": metroDists[name] }
        out[name]["lines"] += lines

with open(sys.argv[3], "r") as fp:
    reader = csv.reader(fp, delimiter=",", quotechar='"')
    next(reader, None)  # skip the headers
    for row in reader:
        name = row[1][:-8]
        if name + " Airport" in out:
            name += " Airport"
        entries = int(row[-2])
        exits = int(row[-1])
        if name in out:
            out[name]["usage"] = int((entries + exits) / 2)

with open(sys.argv[4], "r") as fp:
    reader = csv.reader(fp, delimiter=",", quotechar='"')
    next(reader, None)  # skip the headers
    for row in reader:
        name = row[2]
        if " Station, Platform " in name:
            stationName = name.split(" Station, Platform ")[0]
            if stationName in out:
                if "platforms" not in out[stationName]:
                    out[stationName]["platforms"] = 0
                out[stationName]["platforms"] += 1

result = []
for stationName in out.keys():
    obj = {
        "name": stationName,
        "lines": out[stationName]["lines"],
        "dist": out[stationName]["dist"],
        "usage": out[stationName]["usage"],
        "platforms": out[stationName]["platforms"]
    }
    result.append(obj)
print(json.dumps(result))
