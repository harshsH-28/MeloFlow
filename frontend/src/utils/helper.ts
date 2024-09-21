export const parseManifest = async (manifestUrl: string): Promise<string[]> => {
  const response = await fetch(manifestUrl);
  const manifest = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(manifest, "text/xml");

  const segmentTemplate = xmlDoc.querySelector("SegmentTemplate");
  if (!segmentTemplate)
    throw new Error("SegmentTemplate not found in manifest");

  const timescale = parseInt(segmentTemplate.getAttribute("timescale") || "1");
  const initialization = segmentTemplate.getAttribute("initialization") || "";
  const media = segmentTemplate.getAttribute("media") || "";
  const startNumber = parseInt(
    segmentTemplate.getAttribute("startNumber") || "1"
  );

  const segmentTimeline = xmlDoc.querySelector("SegmentTimeline");
  if (!segmentTimeline)
    throw new Error("SegmentTimeline not found in manifest");

  const segments = Array.from(segmentTimeline.getElementsByTagName("S"));

  const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf("/") + 1);
  console.log(baseUrl);
  const segmentUrls: string[] = [];

  segmentUrls.push(`${baseUrl}${initialization}`);

  let segmentNumber = startNumber;
  segments.forEach((segment) => {
    const duration = parseInt(segment.getAttribute("d") || "0");
    const repeat = segment.hasAttribute("r")
      ? parseInt(segment.getAttribute("r") || "0")
      : 0;

    for (let i = 0; i <= repeat; i++) {
      const segmentUrl = `${baseUrl}${media
        .replace("$RepresentationID$", "0")
        .replace("$Number%05d$", segmentNumber.toString().padStart(5, "0"))}`;
      segmentUrls.push(segmentUrl);
      segmentNumber++;
    }
  });

  return segmentUrls;
};
