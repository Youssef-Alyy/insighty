import pathlib
import csv
import json

from db import models

figures_path = pathlib.Path(__file__).parent / "figures"


def load() -> list[models.Graph]:
    graphs = []

    for figure_category_path in figures_path.iterdir():
        if not figure_category_path.is_dir():
            continue

        for figure_path in figure_category_path.iterdir():
            if not figure_path.is_dir():
                continue

            summary_path = figure_path / "summary.txt"
            thumbnail_path = figure_path / "thumbnail.png"
            url_path = figure_path / "url.txt"
            insight_path = figure_path / "insight.txt"

            if not summary_path.exists():
                raise ValueError(f"summary file not found: {summary_path}")
            if not thumbnail_path.exists():
                raise ValueError(f"Thumbnail file not found: {thumbnail_path}")
            if not url_path.exists():
                raise ValueError(f"URL file not found: {url_path}")
            if not insight_path.exists():
                raise ValueError(f"Insight file not found: {insight_path}")

            with open(summary_path, encoding="utf-8") as f:
                summary = f.read().strip()
            with open(url_path, encoding="utf-8") as f:
                url = f.read().strip()
            with open(insight_path, encoding="utf-8") as f:
                insight = f.read().strip()
            with open(thumbnail_path, "rb") as f:
                thumbnail = f.read().hex()

            csvs = []
            jsonspath = []
            for data_path in figure_path.glob("*.csv"):
                if not data_path.exists():
                    raise ValueError(f"Data file not found: {data_path}")
                with open(data_path, encoding="utf-8") as f:
                    csv_content = f.read().strip()
                    csvs.append(csv_content)

                # Convert CSV to JSON and save it
                json_path = data_path.with_suffix(".json")
                with open(data_path, encoding="utf-8") as csvfile:
                    csv_reader = csv.DictReader(csvfile, delimiter=';')
                    json_data = list(csv_reader)
                jsonspath.append(json_path.absolute().as_posix())

                with open(json_path, "w", encoding="utf-8") as jsonfile:
                    json.dump(json_data, jsonfile, indent=4)

            title = " ".join(word.capitalize() for word in figure_path.name.split("_"))
            category = " ".join(
                word.capitalize() for word in figure_category_path.name.split("_")
            )

            graph = models.Graph(
                title=title,
                category=category,
                url=url,
                thumbnail=thumbnail,
                insight=insight,
                summary=summary,
                csv1=csvs[0],
                csv2=csvs[1] if len(csvs) > 1 else None,
                json1path=jsonspath[0],
                json2path=jsonspath[1] if len(jsonspath) > 1 else None,
            )

            graphs.append(graph)

    return graphs
