import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import {
	useState,
	useEffect
} from 'react'

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'Global Trust Recommendation',
	viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => [
	{
		rel: 'stylesheet',
		href: '/main.css',
	},
]

let isHydrating = true;

export default function App() {
	let [isHydrated, setIsHydrated] = useState(
		!isHydrating
	)

	useEffect(() => {
		isHydrating = false
		setIsHydrated(true)
	}, [])

	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				{isHydrated && <><Outlet /></>}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />

				<script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-DBN8023PFS"
				></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-DBN8023PFS');`,
					}}
				></script>
			</body>
		</html>
	)
}
