const socket = io();

/** Elements */
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

/** Templates */
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

/** Options */
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
	/** New message element */
	const $newMessage = $messages.lastElementChild;

	/** Height of the new message */
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	/** Visible height */
	const visibleHeight = $messages.offsetHeight;

	/** Height of messages container */
	const containerHeight = $messages.scrollHeight;

	/** How far have I scrolled? */
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

/** Message Template */
socket.on('message', (message) => {
	const html = Mustache.render($messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm A'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

/** Location Template */
socket.on('locationMessage', (message) => {
	const html = Mustache.render($locationMessageTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm A'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

/** Room Users */
socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render($sidebarTemplate, {
		room,
		users,
	});
	document.querySelector('#sidebar').innerHTML = html;
});

/** Message Form Submit */
$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();

	/** Disable Button */
	$messageFormButton.setAttribute('disabled', 'disabled');

	const message = e.target.elements.message.value;

	socket.emit('sendMessage', message, (error) => {
		/** Enable Form */
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();

		/** Event Acknowledgements */
		if (error) {
			return console.log(error);
		}
		console.log('The message was delivered!');
	});
});

/** Send Location */
$sendLocationButton.addEventListener('click', () => {
	/** Check if browser supported*/
	if (!navigator.geolocation) {
		alert('Geolocation is not supported by your browser.');
	}

	/** Disable Button */
	$sendLocationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			() => {
				/** Enable Form */
				$sendLocationButton.removeAttribute('disabled');

				/** Event Acknowledgements */
				console.log('Location shared!');
			}
		);
	});
});

/** Send Username & Room */
socket.emit('join', { username, room }, (error) => {
	/** Event Acknowledgements */
	if (error) {
		alert(error);
		location.href = '/';
	}
});
