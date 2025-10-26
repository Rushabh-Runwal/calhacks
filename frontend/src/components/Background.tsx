import Image from 'next/image'

export default function Background() {
  return (
    <div className="background-container fixed inset-0 w-full h-full -z-10">
      {/* Sun (orbiting) */}
      <div className="sun-fan">
        <Image
          src="/Hero/sun_rays.svg"
          alt="Sun Rays"
          fill
          className="sun-fan-img"
          priority
        />
      </div>
      <div className="sun-disk" aria-hidden="true" />
      <Image
        src="/Hero/cloud_one.svg"
        alt="Cloud"
        className="cloud cloud-1"
        width={300}
        height={100}
      />
      <Image
        src="/Hero/cloud_two.svg"
        alt="Cloud"
        className="cloud cloud-2"
        width={250}
        height={100}
      />
      <Image
        src="/Hero/cloud_three.svg"
        alt="Cloud"
        className="cloud cloud-3"
        width={550}
        height={100}
      />
      <Image
        src="/Hero/cloud_four.svg"
        alt="Cloud"
        className="cloud cloud-4"
        width={200}
        height={100}
      />
      <Image
        src="/Hero/cloud_five.svg"
        alt="Cloud"
        className="cloud cloud-5"
        width={200}
        height={100}
      />
      <Image
        src="/Hero/dark_green_mountain.svg"
        alt="Mountains"
        className="mountain"
        width={1050}
        height={500}
        style={{ zIndex: 2 }}
        priority
      />
      <Image
        src="/Hero/medium_green_mountain.svg"
        alt="Mountains"
        className="medmountain"
        width={550}
        height={400}
        style={{ zIndex: 2 }}
        priority
      />
      <Image
        src="/Hero/side_mountain.svg"
        alt="Mountains"
        className="sidemountain"
        width={250}
        height={400}
        style={{ zIndex: 2 }}
        priority
      />
      <Image
        src="/Hero/side_mountain.svg"
        alt="Mountains"
        className="sidemountain2"
        width={300}
        height={400}
        style={{ zIndex: 2 }}
        priority
      />
      <Image
        src="/Hero/dark_water_layer.88343155.svg"
        alt="Water"
        className="water"
        width={1820}
        height={400}
        style={{ zIndex: 1 }}
        priority
      />
      <Image
        src="/Hero/tom.png"
        alt="Water"
        className="tom"
        width={200}
        height={200}
        priority
      />
      <Image
        src="/Hero/dark_beach_layer.06a45771.svg"
        alt="Water"
        className="beach-layer"
        width={650}
        height={200}
        priority
      />
      <Image
        src="/Hero/two_sparkles.svg"
        alt="Sparkles"
        width={50}
        height={30}
        style={{ top: '35%', right: '20%' }}
      />
    </div>
  )
}