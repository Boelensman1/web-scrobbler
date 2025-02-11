export {};

const artistSelector = [
	'.playbackSoundBadge__titleContextContainer > a',
	'[class*=MiniPlayer_MiniPlayerArtist]',
];
const trackSelector = [
	'.playbackSoundBadge__titleLink > span:nth-child(2)',
	'[class*=MiniPlayer_MiniPlayerTrack]',
];
const trackArtSelector = [
	'.playControls span.sc-artwork',
	'[class*=MiniPlayer_MiniPlayerArtworkImage]',
];
const desktopDurationSelector =
	'.playbackTimeline__duration > span:nth-child(2)';
const desktopCurrentTimeSelector =
	'.playbackTimeline__timePassed > span:nth-child(2)';
const mobileProgressSelector = '[class*=MiniPlayer_MiniPlayerProgressBar]';

Connector.playerSelector = ['.playControls', '[class*=MiniPlayer_MiniPlayer]'];

Connector.getCurrentTime = () => {
	const desktopCurrentTime = document.querySelector(
		desktopCurrentTimeSelector,
	);
	if (desktopCurrentTime) {
		return Util.getSecondsFromSelectors(desktopCurrentTimeSelector);
	}

	return Number(
		document.querySelector(mobileProgressSelector)?.getAttribute('value'),
	);
};

Connector.getDuration = () => {
	const time = getDurationOrRemainingTime();
	return time && time > 0 ? time : null;
};

Connector.getRemainingTime = () => {
	const time = getDurationOrRemainingTime();
	return time && time < 0 ? time : null;
};

Connector.getArtistTrack = () => {
	let { artist, track } = Util.processSoundCloudTrack(
		Util.getTextFromSelectors(trackSelector),
	);
	if (!artist) {
		artist = Util.getTextFromSelectors(artistSelector);
	}

	return { artist, track };
};

Connector.getTrackArt = () => {
	const trackArtUrl = Util.extractImageUrlFromSelectors(trackArtSelector);
	if (trackArtUrl) {
		return trackArtUrl.replace('-t50x50.', '-t200x200.');
	}

	return null;
};

Connector.isPlaying = () =>
	Util.hasElementClass('.playControl', 'playing') ||
	document
		.querySelector('[class*=IconButton_Medium]')
		?.getAttribute('data-testid') === 'miniplayer-pause';

Connector.getUniqueID = () => {
	const titleLink = document.querySelector(
		'.playbackSoundBadge__titleLink',
	) as HTMLAnchorElement | null;

	// We don't have this on mobile.
	if (!titleLink) {
		return null;
	}

	const url = new URL(titleLink.href);
	return url.origin + url.pathname;
};

Connector.getOriginUrl = () => {
	return Connector.getUniqueID();
};

const filterArtistPremiereRules = [
	{ source: /^\s*Premiere.*:\s*/i, target: '' },
	{ source: /^\s*\*\*Premiere\*\*\s*/i, target: '' },
];

const filterTrackPremiereRules = [{ source: /\[.*Premiere.*\]/i, target: '' }];

function filterArtistPremiere(text: string) {
	return MetadataFilter.filterWithFilterRules(
		text,
		filterArtistPremiereRules,
	);
}

function filterTrackPremiere(text: string) {
	return MetadataFilter.filterWithFilterRules(text, filterTrackPremiereRules);
}

Connector.applyFilter(
	MetadataFilter.createYouTubeFilter().append({
		artist: filterArtistPremiere,
		track: filterTrackPremiere,
	}),
);

function getDurationOrRemainingTime() {
	const desktopDuration = document.querySelector(desktopDurationSelector);
	if (desktopDuration) {
		return Util.getSecondsFromSelectors(desktopDurationSelector);
	}

	return Number(
		document.querySelector(mobileProgressSelector)?.getAttribute('max'),
	);
}
