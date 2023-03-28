import { LoaderArgs } from '@remix-run/node'
import {
	useLoaderData,
	useNavigate,
	useLocation

} from '@remix-run/react'
import { useEffect, useState } from 'react'
import {
	globalRankings,
	PER_PAGE,
	rankingCounts,
	Profile
} from '~/api/api'
import LoadingIndicator from '~/components/LoadingIndicator'
import Pagination from '~/components/Pagination'
import { explorerNFTURL } from '~/utils'
import { getContractMeta } from '~/api/meta'

export const loader = async (location: any) => {
	const urlParams = new URLSearchParams(location.search);
	const page = Number(urlParams.get('page'))
	const [results, count] = await Promise.all([
		globalRankings(page),
		rankingCounts(),
	])


	const data = {
		results: results || [],
		page,
		count
	}

	return data
}

export default function Index() {
	const location = useLocation()

	const [data, setData] = useState({
		results: [] as Profile[],
		page: 1,
		count: 0
	})

	const [contractsMeta, setContractsMeta] = useState(new Map())

	const navigate = useNavigate()

	useEffect(() => {
		const run = async () => {
			const contracts = data.results

			const acc = new Map()
			for (const contract of contracts) {
				const a = contract.address

				try {
					const res = await getContractMeta(a)
					acc.set(a, res)

					setContractsMeta(new Map([...acc, ...contractsMeta]))

				} catch (e) { }

			}
		}

		run()
	}, [data, location])

	useEffect(() => {
		console.log('run once')
		const run = async () => {
			// @ts-ignore
			const d = await loader(location)
			setData(d)
		}

		run()
	}, [location])

	console.log({ contractsMeta: Array.from(contractsMeta) })

	return (
		<main>
			<LoadingIndicator />

			<a href="https://k3l.io" target="_blank">
				<img
					width="180px"
					className="logo"
					src="/logo.svg"
					draggable="false"
					alt="Karma3Labs Logo"
				/>
			</a>

			<div className="container">
				<header>
					<div className="title">
						<h1>Global Trust Rankings</h1>
						<p>
							<small>
								Rankings based on EigenTrust algorithm.
							</small>
						</p>
					</div>

				</header>
				<div className="profiles-container">
					<div className="profiles-grid">
						<div>

							<strong></strong>
							<strong>NFT Collection</strong>


							<strong>Score</strong>

						</div>
						<span></span><span></span><span></span>
						{data.results.map((p) => (
							<div
								key={p.address}
								style={{ minHeight: 30 }}
							>

								{
									contractsMeta.has(p.address) ? <>
										<img
											style={{ width: 30 }}

											src={contractsMeta.get(p.address).image as string} />
									</> : <span></span>}


								<span>
									<a href={explorerNFTURL(p.address)} target="_blank" rel="noopener noreferrer">

										{p.name} {p.symbol}
									</a>
								</span>


								<span>{p.score + 1}</span>

							</div>
						))}
						{data.results.length === 0 && <div>No results</div>}
					</div>

					<Pagination
						numberOfPages={Math.ceil(data.count / PER_PAGE)}
						currentPage={data.page}
					/>

				</div>
			</div>
		</main>
	)
}

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<main>
			<div className="container">
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>
			</div>
		</main>
	)
}
